
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member, FeedbackSession, PageId } from '../types';
import * as api from '../services/api';

interface AppContextType {
  token: string | null;
  loggedInMember: Member | null;
  sessions: FeedbackSession[];
  theme: 'light' | 'dark';
  activeSession: FeedbackSession | null;
  authorHash: string | null;
  selectedSession: FeedbackSession | null;
  selectedMember: Member | null;
  selectedYear: string;
  adminPassword: string;
  
  setToken: (token: string | null) => void;
  setLoggedInMember: (member: Member | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveSession: (session: FeedbackSession | null) => void;
  setAuthorHash: (hash: string | null) => void;
  setSelectedSession: (session: FeedbackSession | null) => void;
  setSelectedMember: (member: Member | null) => void;
  setSelectedYear: (year: string) => void;
  setAdminPassword: (password: string) => void;
  
  refreshSessions: () => Promise<FeedbackSession[] | undefined>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
  const [loggedInMember, setLoggedInMember] = useState<Member | null>(
    JSON.parse(sessionStorage.getItem('member') || 'null')
  );
  const [sessions, setSessions] = useState<FeedbackSession[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  
  const [activeSession, setActiveSession] = useState<FeedbackSession | null>(null);
  const [authorHash, setAuthorHash] = useState<string | null>(sessionStorage.getItem('authorHash'));
  const [selectedSession, setSelectedSession] = useState<FeedbackSession | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [adminPassword, setAdminPassword] = useState<string>('0000');

  const refreshSessions = useCallback(async () => {
    if (!token) return;
    try {
      const data: FeedbackSession[] = await api.fetchSessions(token);
      setSessions(data);
      setActiveSession(prev => {
        if (!prev) return null;
        const updated = data.find(s => s.id === prev.id);
        return updated || null;
      });
      setSelectedSession(prev => {
        if (!prev) return null;
        const updated = data.find(s => s.id === prev.id);
        return updated || null;
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, [token]);

  useEffect(() => {
    // Clear any lingering localStorage auth tokens from earlier versions
    localStorage.removeItem('token');
    localStorage.removeItem('member');
    localStorage.removeItem('authorHash');
  }, []);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
      Promise.resolve().then(() => refreshSessions());
    } else {
      sessionStorage.removeItem('token');
    }
  }, [token, refreshSessions]);

  useEffect(() => {
    if (loggedInMember) {
      sessionStorage.setItem('member', JSON.stringify(loggedInMember));
    } else {
      sessionStorage.removeItem('member');
    }
  }, [loggedInMember]);

  useEffect(() => {
    if (authorHash) {
      sessionStorage.setItem('authorHash', authorHash);
    } else {
      sessionStorage.removeItem('authorHash');
    }
  }, [authorHash]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  const logout = () => {
    setToken(null);
    setLoggedInMember(null);
    setSessions([]);
    setAuthorHash(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('member');
    sessionStorage.removeItem('authorHash');
    localStorage.removeItem('token');
    localStorage.removeItem('member');
    localStorage.removeItem('authorHash');
  };

  return (
    <AppContext.Provider value={{
      token,
      loggedInMember,
      sessions,
      theme,
      activeSession,
      authorHash,
      selectedSession,
      selectedMember,
      selectedYear,
      adminPassword,
      setToken,
      setLoggedInMember,
      setTheme,
      setActiveSession,
      setAuthorHash,
      setSelectedSession,
      setSelectedMember,
      setSelectedYear,
      setAdminPassword,
      refreshSessions,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
