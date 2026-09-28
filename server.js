import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SALT_ROUNDS = 10;
const FEEDBACK_SALT = process.env.FEEDBACK_SALT || "dnd-feedback-secret-salt-2025";
const JWT_SECRET = process.env.JWT_SECRET || "dnd-jwt-secret-key-2025";

function getAuthorHash(memberId) {
  return crypto.createHash('sha256').update(memberId + FEEDBACK_SALT).digest('hex');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  const router = express.Router();

  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  app.use("/feedback", router);
  app.use("/api", router);
  app.use("/", router);

  // Database setup
  const db = await open({
    filename: path.join(__dirname, "database.sqlite"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT,
      team TEXT,
      isAvailable INTEGER DEFAULT 1,
      joinYear TEXT,
      loginCode TEXT,
      isFirstLogin INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      year TEXT,
      type TEXT,
      period TEXT,
      code TEXT
    );

    CREATE TABLE IF NOT EXISTS session_members (
      session_id TEXT,
      member_id TEXT,
      PRIMARY KEY (session_id, member_id),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      member_id TEXT,
      author_hash TEXT,
      good TEXT,
      suggestions TEXT,
      UNIQUE(session_id, member_id, author_hash)
    );

    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      author_hash TEXT,
      content TEXT,
      UNIQUE(session_id, author_hash)
    );

    CREATE INDEX IF NOT EXISTS idx_session_members_session_id ON session_members(session_id);
    CREATE INDEX IF NOT EXISTS idx_session_members_member_id ON session_members(member_id);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_session_id ON feedbacks(session_id);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_member_id ON feedbacks(member_id);
    CREATE INDEX IF NOT EXISTS idx_insights_session_id ON insights(session_id);
  `);

  // Initial Data Migration (if empty)
  const memberCount = await db.get("SELECT COUNT(*) as count FROM members");
  if (memberCount.count === 0) {
    const initialMembers = [
      { id: '1', name: '김철수', team: '기획팀 (Planning Team)', joinYear: '2023.01', loginCode: 'KC1234' },
      { id: '2', name: '이영희', team: '기획팀 (Planning Team)', joinYear: '2023.01', loginCode: 'LY5678' },
      { id: '3', name: '박지민', team: '기획팀 (Planning Team)', joinYear: '2023.01', loginCode: 'PJ9012' },
      { id: '4', name: '최유진', team: '기획팀 (Planning Team)', joinYear: '2024.12', loginCode: 'CY3456' },
      { id: '5', name: '오동훈', team: '기획팀 (Planning Team)', joinYear: '2024.12', loginCode: 'OD7890' },
    ];

    for (const m of initialMembers) {
      const hashedCode = await bcrypt.hash(m.loginCode, SALT_ROUNDS);
      await db.run(
        "INSERT INTO members (id, name, team, joinYear, loginCode) VALUES (?, ?, ?, ?, ?)",
        [m.id, m.name, m.team, m.joinYear, hashedCode]
      );
    }

    const initialSessions = [
      { id: 's1', year: '2025', type: '360도 다면 피드백', period: '2025.01.01 - 2025.12.31', code: 'DND2025' },
      { id: 's2', year: '2025', type: '인사이트 피드백', period: '2025.01.01 - 2025.12.31', code: 'DND2025' }
    ];

    for (const s of initialSessions) {
      await db.run(
        "INSERT INTO sessions (id, year, type, period, code) VALUES (?, ?, ?, ?, ?)",
        [s.id, s.year, s.type, s.period, s.code]
      );
      for (const m of initialMembers) {
        await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [s.id, m.id]);
      }
    }
  }

  // API Routes
  router.get("/api/sessions", authenticate, asyncHandler(async (req, res) => {
    const sessions = await db.all("SELECT * FROM sessions");
    
    const allSessionMembers = await db.all(`
      SELECT sm.session_id, m.* FROM members m
      JOIN session_members sm ON m.id = sm.member_id
    `);
    
    const allFeedbacks = await db.all("SELECT * FROM feedbacks");
    const allInsights = await db.all("SELECT * FROM insights");

    const result = sessions.map(s => {
      const members = allSessionMembers
        .filter(m => m.session_id === s.id)
        .map(m => ({ ...m, isAvailable: m.isAvailable === 1, isFirstLogin: m.isFirstLogin === 1 }));
      
      const feedbacks = {};
      allFeedbacks
        .filter(fb => fb.session_id === s.id)
        .forEach(fb => {
          if (!feedbacks[fb.member_id]) feedbacks[fb.member_id] = [];
          feedbacks[fb.member_id].push({ 
            good: fb.good, 
            suggestions: fb.suggestions,
            authorHash: fb.author_hash 
          });
        });

      const insights = allInsights
        .filter(i => i.session_id === s.id)
        .map(i => ({ content: i.content, authorHash: i.author_hash }));

      return {
        ...s,
        members,
        feedbacks: s.type === '360도 다면 피드백' ? feedbacks : undefined,
        insights: s.type === '인사이트 피드백' ? insights : undefined
      };
    });
    
    res.json(result);
  }));

  router.get("/api/sessions/:id", authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const s = await db.get("SELECT * FROM sessions WHERE id = ?", [id]);
    
    if (!s) {
      return res.status(404).json({ error: "Session not found" });
    }

    const members = await db.all(`
      SELECT m.* FROM members m
      JOIN session_members sm ON m.id = sm.member_id
      WHERE sm.session_id = ?
    `, [id]);
    
    const feedbacks = {};
    const fbList = await db.all("SELECT * FROM feedbacks WHERE session_id = ?", [id]);
    fbList.forEach(fb => {
      if (!feedbacks[fb.member_id]) feedbacks[fb.member_id] = [];
      feedbacks[fb.member_id].push({ 
        good: fb.good, 
        suggestions: fb.suggestions,
        authorHash: fb.author_hash 
      });
    });

    const insights = await db.all("SELECT content, author_hash FROM insights WHERE session_id = ?", [id]);

    res.json({
      ...s,
      members: members.map(m => ({ ...m, isAvailable: m.isAvailable === 1, isFirstLogin: m.isFirstLogin === 1 })),
      feedbacks: s.type === '360도 다면 피드백' ? feedbacks : undefined,
      insights: s.type === '인사이트 피드백' ? insights.map(i => ({ content: i.content, authorHash: i.author_hash })) : undefined
    });
  }));

  router.post("/api/admin/login", asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (password === "0000") {
      const token = jwt.sign(
        { id: "admin", name: "Administrator", role: "admin" },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid admin password" });
    }
  }));

  router.post("/api/login", asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    
    const members = await db.all(`
      SELECT m.*, sm.session_id FROM members m
      JOIN session_members sm ON m.id = sm.member_id
      WHERE m.name = ?
    `, [name]);

    let matchedMember = null;
    for (const m of members) {
      const isMatch = await bcrypt.compare(code, m.loginCode);
      if (isMatch) {
        matchedMember = m;
        break;
      }
    }

    if (matchedMember) {
      const token = jwt.sign(
        { id: matchedMember.id, name: matchedMember.name },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ 
        member: { ...matchedMember, isAvailable: matchedMember.isAvailable === 1, isFirstLogin: matchedMember.isFirstLogin === 1 },
        sessionId: matchedMember.session_id,
        authorHash: getAuthorHash(matchedMember.id),
        token
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }));

  router.post("/api/members/code", authenticate, asyncHandler(async (req, res) => {
    const { memberId, newCode } = req.body;
    const hashedCode = await bcrypt.hash(newCode, SALT_ROUNDS);
    await db.run("UPDATE members SET loginCode = ?, isFirstLogin = 0 WHERE id = ?", [hashedCode, memberId]);
    res.json({ success: true });
  }));

  router.post("/api/members/reset", authenticate, asyncHandler(async (req, res) => {
    const { sessionId, memberId } = req.body;
    const session = await db.get("SELECT code FROM sessions WHERE id = ?", [sessionId]);
    if (session) {
      const hashedCode = await bcrypt.hash(session.code, SALT_ROUNDS);
      await db.run("UPDATE members SET loginCode = ?, isFirstLogin = 1 WHERE id = ?", [hashedCode, memberId]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  }));

  router.post("/api/feedbacks", authenticate, asyncHandler(async (req, res) => {
    const { sessionId, memberId, authorId, good, suggestions } = req.body;
    const authorHash = getAuthorHash(authorId);
    
    await db.run(
      "INSERT OR REPLACE INTO feedbacks (session_id, member_id, author_hash, good, suggestions) VALUES (?, ?, ?, ?, ?)",
      [sessionId, memberId, authorHash, good, suggestions]
    );
    res.json({ success: true });
  }));

  router.post("/api/insights", authenticate, asyncHandler(async (req, res) => {
    const { sessionId, authorId, content } = req.body;
    const authorHash = getAuthorHash(authorId);
    await db.run(
      "INSERT OR REPLACE INTO insights (session_id, author_hash, content) VALUES (?, ?, ?)", 
      [sessionId, authorHash, content]
    );
    res.json({ success: true });
  }));

  router.post("/api/sessions/register", authenticate, asyncHandler(async (req, res) => {
    const { id, year, type, period, code, members } = req.body;
    
    if (!id || !year || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.run(
      "INSERT INTO sessions (id, year, type, period, code) VALUES (?, ?, ?, ?, ?)",
      [id, year, type, period, code]
    );

    for (const m of members) {
      let existing = await db.get("SELECT id FROM members WHERE id = ?", [m.id]);
      if (!existing) {
        const loginCodeToHash = String(m.loginCode || code || "");
        const hashedCode = await bcrypt.hash(loginCodeToHash, SALT_ROUNDS);
        await db.run(
          "INSERT INTO members (id, name, team, joinYear, loginCode, isFirstLogin) VALUES (?, ?, ?, ?, ?, ?)",
          [m.id, m.name, m.team, m.joinYear, hashedCode, m.isFirstLogin ? 1 : 0]
        );
      }
      await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [id, m.id]);
    }

    if (type === '360도 다면 피드백') {
      const insightSession = await db.get("SELECT id FROM sessions WHERE year = ? AND type = '인사이트 피드백'", [year]);
      if (insightSession) {
        await db.run("DELETE FROM session_members WHERE session_id = ?", [insightSession.id]);
        for (const m of members) {
          await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [insightSession.id, m.id]);
        }
        await db.run("UPDATE sessions SET code = ? WHERE id = ?", [code, insightSession.id]);
      }
    }

    res.json({ success: true });
  }));

  router.put("/api/sessions/:id", authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { period, members, code, type, year } = req.body;

    await db.run("UPDATE sessions SET period = ?, code = ? WHERE id = ?", [period, code, id]);
    
    await db.run("DELETE FROM session_members WHERE session_id = ?", [id]);
    for (const m of members) {
      let existing = await db.get("SELECT id FROM members WHERE id = ?", [m.id]);
      if (!existing) {
        const loginCodeToHash = String(m.loginCode || code || "");
        const hashedCode = await bcrypt.hash(loginCodeToHash, SALT_ROUNDS);
        await db.run(
          "INSERT INTO members (id, name, team, joinYear, loginCode, isFirstLogin) VALUES (?, ?, ?, ?, ?, ?)",
          [m.id, m.name, m.team, m.joinYear, hashedCode, m.isFirstLogin ? 1 : 0]
        );
      }
      await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [id, m.id]);
    }

    if (type === '360도 다면 피드백') {
      const insightSession = await db.get("SELECT id FROM sessions WHERE year = ? AND type = '인사이트 피드백'", [year]);
      if (insightSession) {
        await db.run("DELETE FROM session_members WHERE session_id = ?", [insightSession.id]);
        for (const m of members) {
          await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [insightSession.id, m.id]);
        }
        await db.run("UPDATE sessions SET code = ? WHERE id = ?", [code, insightSession.id]);
      }
    }

    res.json({ success: true });
  }));

  router.delete("/api/sessions/:sessionId/members/:memberId", authenticate, asyncHandler(async (req, res) => {
    const { sessionId, memberId } = req.params;
    await db.run("DELETE FROM session_members WHERE session_id = ? AND member_id = ?", [sessionId, memberId]);
    
    const session = await db.get("SELECT year, type FROM sessions WHERE id = ?", [sessionId]);
    if (session && session.type === '360도 다면 피드백') {
      const insightSession = await db.get("SELECT id FROM sessions WHERE year = ? AND type = '인사이트 피드백'", [session.year]);
      if (insightSession) {
        await db.run("DELETE FROM session_members WHERE session_id = ? AND member_id = ?", [insightSession.id, memberId]);
      }
    }
    res.json({ success: true });
  }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use("/feedback/assets", express.static(path.join(distPath, "assets")));
    app.use("/feedback", express.static(distPath));

    app.get("/", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.get(/^\/feedback(?:\/.*)?$/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
