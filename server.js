import express from "express";
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
  return crypto.createHash("sha256").update(memberId + FEEDBACK_SALT).digest("hex");
}
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : process.env.NODE_ENV === "production" ? 4e3 : 3e3;
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
  app.use("/feedback", router);
  app.use("/api", router);
  app.use("/", router);
  const db = await open({
    filename: path.join(__dirname, "database.sqlite"),
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT,
      team TEXT,
      isAvailable INTEGER DEFAULT 1,
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
      rehire INTEGER,
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
  try {
    await db.exec("ALTER TABLE feedbacks ADD COLUMN rehire INTEGER");
  } catch (e) {
  }
  const memberCount = await db.get("SELECT COUNT(*) as count FROM members");
  router.get("/api/sessions", authenticate, asyncHandler(async (req, res) => {
    const sessions = await db.all("SELECT * FROM sessions");
    const allSessionMembers = await db.all(`
      SELECT sm.session_id, m.* FROM members m
      JOIN session_members sm ON m.id = sm.member_id
    `);
    const allFeedbacks = await db.all("SELECT * FROM feedbacks");
    const allInsights = await db.all("SELECT * FROM insights");
    const result = sessions.map((s) => {
      const members = allSessionMembers.filter((m) => m.session_id === s.id).map((m) => ({ ...m, isAvailable: m.isAvailable === 1, isFirstLogin: m.isFirstLogin === 1 }));
      const feedbacks = {};
      allFeedbacks.filter((fb) => fb.session_id === s.id).forEach((fb) => {
        if (!feedbacks[fb.member_id]) feedbacks[fb.member_id] = [];
        feedbacks[fb.member_id].push({
          good: fb.good,
          suggestions: fb.suggestions,
          rehire: fb.rehire === null ? void 0 : Number(fb.rehire) === 1,
          authorHash: fb.author_hash
        });
      });
      const insights = allInsights.filter((i) => i.session_id === s.id).map((i) => ({ content: i.content, authorHash: i.author_hash }));
      return {
        ...s,
        members,
        feedbacks: s.type === "360\uB3C4 \uB2E4\uBA74 \uD53C\uB4DC\uBC31" ? feedbacks : void 0,
        insights: s.type === "\uC778\uC0AC\uC774\uD2B8 \uD53C\uB4DC\uBC31" ? insights : void 0
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
    fbList.forEach((fb) => {
      if (!feedbacks[fb.member_id]) feedbacks[fb.member_id] = [];
      feedbacks[fb.member_id].push({
        good: fb.good,
        suggestions: fb.suggestions,
        rehire: fb.rehire === null ? void 0 : Number(fb.rehire) === 1,
        authorHash: fb.author_hash
      });
    });
    const insights = await db.all("SELECT content, author_hash FROM insights WHERE session_id = ?", [id]);
    res.json({
      ...s,
      members: members.map((m) => ({ ...m, isAvailable: m.isAvailable === 1, isFirstLogin: m.isFirstLogin === 1 })),
      feedbacks: s.type === "360\uB3C4 \uB2E4\uBA74 \uD53C\uB4DC\uBC31" ? feedbacks : void 0,
      insights: s.type === "\uC778\uC0AC\uC774\uD2B8 \uD53C\uB4DC\uBC31" ? insights.map((i) => ({ content: i.content, authorHash: i.author_hash })) : void 0
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
    let { sessionId, memberId } = req.body;
    let member = await db.get("SELECT * FROM members WHERE id = ?", [memberId]);
    if (!member && sessionId) {
      const swapMember = await db.get("SELECT * FROM members WHERE id = ?", [sessionId]);
      if (swapMember) {
        const temp = memberId;
        memberId = sessionId;
        sessionId = temp;
        member = swapMember;
      }
    }
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    let session = null;
    if (sessionId) {
      session = await db.get("SELECT * FROM sessions WHERE id = ?", [sessionId]);
    }
    if (!session) {
      session = await db.get(`
        SELECT s.* FROM sessions s
        JOIN session_members sm ON s.id = sm.session_id
        WHERE sm.member_id = ?
      `, [memberId]);
    }
    const defaultCode = session && session.code && session.code.trim() ? session.code.trim() : session && session.year ? `DND${session.year}` : `DND${(/* @__PURE__ */ new Date()).getFullYear()}`;
    const hashedCode = await bcrypt.hash(defaultCode, SALT_ROUNDS);
    await db.run("UPDATE members SET loginCode = ?, isFirstLogin = 1 WHERE id = ?", [hashedCode, memberId]);
    res.json({ success: true, memberId, code: defaultCode });
  }));
  router.post("/api/feedbacks", authenticate, asyncHandler(async (req, res) => {
    const { sessionId, memberId, authorId, good, suggestions, rehire } = req.body;
    const authorHash = getAuthorHash(authorId);
    await db.run(
      "INSERT OR REPLACE INTO feedbacks (session_id, member_id, author_hash, good, suggestions, rehire) VALUES (?, ?, ?, ?, ?, ?)",
      [sessionId, memberId, authorHash, good, suggestions, rehire ? 1 : 0]
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
      const existing = await db.get("SELECT id FROM members WHERE id = ?", [m.id]);
      if (!existing) {
        const loginCodeToHash = String(m.loginCode || code || "");
        const hashedCode = await bcrypt.hash(loginCodeToHash, SALT_ROUNDS);
        await db.run(
          "INSERT INTO members (id, name, team, loginCode, isFirstLogin) VALUES (?, ?, ?, ?, ?)",
          [m.id, m.name, m.team, hashedCode, m.isFirstLogin ? 1 : 0]
        );
      }
      await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [id, m.id]);
    }
    if (type === "360\uB3C4 \uB2E4\uBA74 \uD53C\uB4DC\uBC31") {
      const insightSession = await db.get("SELECT id FROM sessions WHERE year = ? AND type = '\uC778\uC0AC\uC774\uD2B8 \uD53C\uB4DC\uBC31'", [year]);
      if (insightSession) {
        for (const m of members) {
          await db.run(
            "INSERT OR IGNORE INTO session_members (session_id, member_id) VALUES (?, ?)",
            [insightSession.id, m.id]
          );
        }
      }
    }
    res.json({ success: true });
  }));
  router.put("/api/sessions/:id", authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { period, members, code, type, year } = req.body;
    const sessionInfo = await db.get("SELECT year, type, code FROM sessions WHERE id = ?", [id]);
    const currentYear = year || sessionInfo?.year;
    const currentType = type || sessionInfo?.type;
    const currentCode = code || sessionInfo?.code;
    await db.run("UPDATE sessions SET period = ?, code = ? WHERE id = ?", [period, currentCode, id]);
    await db.run("DELETE FROM session_members WHERE session_id = ?", [id]);
    for (const m of members) {
      const existing = await db.get("SELECT id FROM members WHERE id = ?", [m.id]);
      if (!existing) {
        const loginCodeToHash = String(m.loginCode || currentCode || "");
        const hashedCode = await bcrypt.hash(loginCodeToHash, SALT_ROUNDS);
        await db.run(
          "INSERT INTO members (id, name, team, loginCode, isFirstLogin) VALUES (?, ?, ?, ?, ?)",
          [m.id, m.name, m.team, hashedCode, m.isFirstLogin ? 1 : 0]
        );
      }
      await db.run("INSERT INTO session_members (session_id, member_id) VALUES (?, ?)", [id, m.id]);
    }
    if (currentType === "360\uB3C4 \uB2E4\uBA74 \uD53C\uB4DC\uBC31") {
      const insightSession = await db.get("SELECT id FROM sessions WHERE year = ? AND type = '\uC778\uC0AC\uC774\uD2B8 \uD53C\uB4DC\uBC31'", [currentYear]);
      if (insightSession) {
        for (const m of members) {
          await db.run(
            "INSERT OR IGNORE INTO session_members (session_id, member_id) VALUES (?, ?)",
            [insightSession.id, m.id]
          );
        }
      }
    }
    res.json({ success: true });
  }));
  router.delete("/api/sessions/:id", authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.run("DELETE FROM sessions WHERE id = ?", [id]);
    await db.run("DELETE FROM session_members WHERE session_id = ?", [id]);
    await db.run("DELETE FROM feedbacks WHERE session_id = ?", [id]);
    await db.run("DELETE FROM insights WHERE session_id = ?", [id]);
    res.json({ success: true });
  }));
  router.delete("/api/sessions/:sessionId/members/:memberId", authenticate, asyncHandler(async (req, res) => {
    const { sessionId, memberId } = req.params;
    await db.run("DELETE FROM session_members WHERE session_id = ? AND member_id = ?", [sessionId, memberId]);
    res.json({ success: true });
  }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use("/feedback/assets", express.static(path.join(distPath, "assets")));
    app.use("/feedback", express.static(distPath));
    app.use("/assets", express.static(path.join(distPath, "assets")));
    app.use("/", express.static(distPath));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
