
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAppContext } from './context/AppContext';
import { useToast } from './hooks/useToast';
import * as api from './services/api';

import P0_Login from './pages/P0_Login';
import P0_1_CodeChange from './pages/P0_1_CodeChange';
import P4_1_AdminPasswordChange from './pages/P4_1_AdminPasswordChange';
import P1_Category from './pages/P1_Category';
import P2_1_Intro from './pages/P2_1_Intro';
import P2_2_MemberList from './pages/P2_2_MemberList';
import P2_3_MemberWrite from './pages/P2_3_MemberWrite';
import P3_1_InsightIntro from './pages/P3_1_InsightIntro';
import P3_2_InsightWrite from './pages/P3_2_InsightWrite';
import P4_AdminDashboard from './pages/P4_AdminDashboard';
import P5_AdminDashboard from './pages/P5_AdminDashboard';
import P5_1_AdminMemberList from './pages/P5_1_AdminMemberList';
import P5_2_AdminMemberDetail from './pages/P5_2_AdminMemberDetail';
import P6_AdminInsightList from './pages/P6_AdminInsightList';
import P7_AdminFeedbackList from './pages/P7_AdminFeedbackList';
import P7_AdminFeedbackSessionCreate from './pages/P7_AdminFeedbackSessionCreate';
import P7_2_AdminMemberManagement from './pages/P7_2_AdminMemberManagement';
import P7_3_AdminMemberRegister from './pages/P7_3_AdminMemberRegister';
import P7_4_AdminFeedbackDetail from './pages/P7_4_AdminFeedbackDetail';
import P7_5_AdminFeedbackEdit from './pages/P7_5_AdminFeedbackEdit';
import Toast from './components/Toast';
import { FeedbackSession, Member } from './types';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    token, setToken, 
    loggedInMember, setLoggedInMember,
    sessions, refreshSessions,
    activeSession, setActiveSession,
    authorHash, setAuthorHash,
    selectedSession, setSelectedSession,
    selectedMember, setSelectedMember,
    selectedYear, setSelectedYear,
    adminPassword, setAdminPassword,
    theme, setTheme, logout
  } = useAppContext();
  const { toastMessage, toastType, showToast } = useToast();

  const [tempSession, setTempSession] = useState<Partial<FeedbackSession>>({});
  const [tempMembers, setTempMembers] = useState<Member[]>([]);

  const handleLogin = async (enteredName: string, enteredCode: string) => {
    try {
      const response = await fetch('/feedback/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: enteredName, code: enteredCode })
      });

      if (response.ok) {
        const { member, sessionId, authorHash: hash, token: newToken } = await response.json();
        setToken(newToken);
        setLoggedInMember(member);
        setAuthorHash(hash);
        
        const sessionsResponse = await fetch('/feedback/api/sessions', {
          headers: { 'Authorization': `Bearer ${newToken}` }
        });
        if (sessionsResponse.ok) {
          const currentSessions = await sessionsResponse.json();
          const session = currentSessions.find((s: any) => s.id === sessionId);
          if (session) {
            if (session.period && session.period.includes(' - ')) {
              const [startStr, endStr] = session.period.split(' - ');
              const now = new Date();
              const start = new Date(startStr.replace(/\./g, '-'));
              const end = new Date(endStr.replace(/\./g, '-'));
              end.setHours(23, 59, 59);
              if (now < start || now > end) {
                showToast('피드백 기간이 아닙니다.', 'warning');
                return;
              }
            }
            setActiveSession(session);
          }
        }
        
        if (member.isFirstLogin) navigate('/code-change');
        else navigate('/category');
      } else {
        showToast('이름 또는 코드가 일치하지 않습니다.', 'warning');
      }
    } catch (error) {
      showToast('로그인 중 오류가 발생했습니다.', 'warning');
    }
  };

  const handleAdminLogin = async (password: string) => {
    try {
      const response = await fetch('/feedback/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        const { token: newToken } = await response.json();
        setToken(newToken);
        await refreshSessions();
        navigate('/admin');
      } else {
        showToast('비밀번호가 틀렸습니다.', 'warning');
      }
    } catch (error) {
      showToast('로그인 중 오류가 발생했습니다.', 'warning');
    }
  };

  const handleFeedbackComplete = async (memberId: string, good: string, suggestions: string, rehire?: boolean) => {
    if (!activeSession) return;
    try {
      const response = await api.authenticatedFetch('/feedback/api/feedbacks', token, {
        method: 'POST',
        body: JSON.stringify({ 
          sessionId: activeSession.id, 
          memberId, 
          authorId: loggedInMember?.id,
          good, 
          suggestions,
          rehire
        })
      });
      if (response.ok) {
        await refreshSessions();
        showToast('피드백이 저장되었습니다.', 'success');
        navigate('/members');
      }
    } catch (error) {
      showToast('피드백 저장 중 오류가 발생했습니다.', 'warning');
    }
  };

  const handleInsightComplete = async (content: string) => {
    if (!activeSession) return;
    try {
      const response = await api.authenticatedFetch('/feedback/api/insights', token, {
        method: 'POST',
        body: JSON.stringify({ 
          sessionId: activeSession.id, 
          authorId: loggedInMember?.id,
          content 
        })
      });
      if (response.ok) {
        await refreshSessions();
        showToast('완료되었습니다.', 'success');
        navigate('/category');
      }
    } catch {
      showToast('저장 중 오류가 발생했습니다.', 'warning');
    }
  };

  const handleRegisterSession = async (year: string, type: any, code: string, period: string, members: Member[] = []) => {
    const membersWithCodes = members.map(m => ({
      ...m,
      loginCode: m.loginCode || code || `DND${year}`,
      isFirstLogin: m.isFirstLogin ?? true
    }));
    const existingSessionForYear = sessions.find(s => s.year === year);
    const randomSuffix = Math.floor(Math.random() * 900 + 100);
    const finalCode = code || existingSessionForYear?.code || `DND${year}${randomSuffix}`;
    const newSession = { id: Math.random().toString(36).substr(2, 9), year, type, code: finalCode, period, members: membersWithCodes };

    try {
      const response = await api.authenticatedFetch('/feedback/api/sessions/register', token, {
        method: 'POST',
        body: JSON.stringify(newSession)
      });
      if (response.ok) {
        await refreshSessions();
        setTempMembers([]); 
        navigate('/admin/sessions');
      }
    } catch {
      showToast('세션 등록 중 오류가 발생했습니다.', 'warning');
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-neutral-900 transition-colors duration-300">
      <div className="w-full max-w-md h-screen bg-background-dark relative flex flex-col shadow-2xl overflow-hidden border-x border-white/5">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><P0_Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} adminPassword={adminPassword} showToast={showToast} theme={theme} onThemeChange={setTheme} /></PageWrapper>} />
            <Route path="/code-change" element={<PageWrapper><P0_1_CodeChange currentName={loggedInMember?.name || ''} onComplete={async (newCode) => {
              if (!loggedInMember) return;
              try {
                const response = await api.authenticatedFetch('/feedback/api/members/code', token, {
                  method: 'POST',
                  body: JSON.stringify({ memberId: loggedInMember.id, newCode })
                });
                if (response.ok) {
                  await refreshSessions();
                  setLoggedInMember({ ...loggedInMember, loginCode: newCode, isFirstLogin: false });
                  showToast('코드가 성공적으로 변경되었습니다.', 'success');
                  navigate('/category');
                }
              } catch { showToast('코드 변경 중 오류가 발생했습니다.', 'warning'); }
            }} onBack={() => navigate('/')} showToast={showToast} /></PageWrapper>} />
            <Route path="/category" element={<PageWrapper>
              <P1_Category 
                availableTypes={Array.from(new Set(sessions.filter(s => s.members.some(m => m.id === loggedInMember?.id)).map(s => s.type)))} 
                onSelect360={() => { 
                  const s = sessions.find(s => s.type === '360도 다면 피드백' && s.members.some(m => m.id === loggedInMember?.id)); 
                  if (s) { setActiveSession(s); navigate('/intro'); }
                }} 
                onSelectInsight={() => { 
                  const s = sessions.find(s => s.type === '인사이트 피드백' && s.members.some(m => m.id === loggedInMember?.id)); 
                  if (s) { setActiveSession(s); navigate('/insight-intro'); }
                }} 
                onBack={() => { logout(); navigate('/'); }} 
              />
            </PageWrapper>} />
            
            <Route path="/intro" element={<PageWrapper><P2_1_Intro onNext={() => navigate('/members')} onBack={() => navigate('/category')} /></PageWrapper>} />
            <Route path="/members" element={<PageWrapper>
              <P2_2_MemberList 
                members={(activeSession?.members || []).filter(m => m.id !== loggedInMember?.id).map(m => ({
                  ...m,
                  isAvailable: !activeSession?.feedbacks?.[m.id]?.some(f => f.authorHash === authorHash)
                }))} 
                onMemberSelect={(m) => { setSelectedMember(m); navigate('/write'); }} 
                onBackToStart={() => navigate('/category')} 
                onBack={() => navigate('/intro')} 
              />
            </PageWrapper>} />
            <Route path="/write" element={<PageWrapper>
              {selectedMember && (
                <P2_3_MemberWrite 
                  member={selectedMember} 
                  initialData={activeSession?.feedbacks?.[selectedMember.id]?.find(f => f.authorHash === authorHash)}
                  onComplete={(good, sug, rehire) => handleFeedbackComplete(selectedMember.id, good, sug, rehire)} 
                  onBack={() => navigate('/members')} 
                />
              )}
            </PageWrapper>} />

            <Route path="/insight-intro" element={<PageWrapper><P3_1_InsightIntro onParticipate={() => navigate('/insight-write')} onBack={() => navigate('/category')} /></PageWrapper>} />
            <Route path="/insight-write" element={<PageWrapper>
              <P3_2_InsightWrite 
                initialData={activeSession?.insights?.find(i => i.authorHash === authorHash)?.content}
                onComplete={handleInsightComplete} 
                onBack={() => navigate('/insight-intro')} 
              />
            </PageWrapper>} />

            <Route path="/admin" element={<PageWrapper><P4_AdminDashboard onGoToDashboard={() => navigate('/admin/results')} onGoToAddFeedback={() => navigate('/admin/sessions')} onGoToPasswordChange={() => navigate('/admin/password')} onBack={() => navigate('/')} /></PageWrapper>} />
            <Route path="/admin/password" element={<PageWrapper><P4_1_AdminPasswordChange currentAdminPassword={adminPassword} onPasswordChanged={(newPw) => { setAdminPassword(newPw); navigate('/admin'); }} onBack={() => navigate('/admin')} showToast={showToast} /></PageWrapper>} />
            <Route path="/admin/results" element={<PageWrapper><P5_AdminDashboard onSelect360={() => navigate('/admin/results/360')} onSelectInsight={() => navigate('/admin/results/insight')} onBack={() => navigate('/admin')} /></PageWrapper>} />
            <Route path="/admin/results/360" element={<PageWrapper><P5_1_AdminMemberList sessions={sessions.filter(s => s.type === '360도 다면 피드백')} onMemberSelect={(m, year) => { setSelectedMember(m); setSelectedYear(year); navigate('/admin/results/360/detail'); }} onBack={() => navigate('/admin/results')} /></PageWrapper>} />
            <Route path="/admin/results/360/detail" element={<PageWrapper>
              {selectedMember && (
                <P5_2_AdminMemberDetail 
                  member={selectedMember} 
                  year={selectedYear} 
                  feedbackData={sessions.find(s => s.year === selectedYear && s.type === '360도 다면 피드백')?.feedbacks?.[selectedMember.id] || null} 
                  onBack={() => navigate('/admin/results/360')} 
                />
              )}
            </PageWrapper>} />
            <Route path="/admin/results/insight" element={<PageWrapper><P6_AdminInsightList sessions={sessions.filter(s => s.type === '인사이트 피드백')} onBack={() => navigate('/admin/results')} /></PageWrapper>} />
            
            <Route path="/admin/sessions" element={<PageWrapper><P7_AdminFeedbackList sessions={sessions} onSelectSession={(s) => { setSelectedSession(s); navigate('/admin/sessions/detail'); }} onRegister={() => navigate('/admin/sessions/create')} onBack={() => navigate('/admin')} /></PageWrapper>} />
            <Route path="/admin/sessions/create" element={<PageWrapper><P7_AdminFeedbackSessionCreate sessions={sessions} onNext={(year, type, period, initialCode) => { 
              setTempSession({ year, type: type as any, period, code: initialCode }); 
              const existing = sessions.find(s => s.year === year);
              setTempMembers(existing ? existing.members : []);
              navigate('/admin/sessions/members'); 
            }} onBack={() => navigate('/admin/sessions')} showToast={showToast} /></PageWrapper>} />
            <Route path="/admin/sessions/members" element={<PageWrapper><P7_2_AdminMemberManagement members={tempMembers} allSessions={sessions} sessionYear={tempSession.year || ''} sessionType={tempSession.type || ''} onDeleteMember={(id) => setTempMembers(prev => prev.filter(m => m.id !== id))} onAddMember={() => navigate('/admin/sessions/members/add')} onMembersLoaded={(loaded) => setTempMembers(loaded)} onRegisterComplete={() => handleRegisterSession(tempSession.year!, tempSession.type!, tempSession.code!, tempSession.period!, tempMembers)} onBack={() => navigate('/admin/sessions/create')} /></PageWrapper>} />
            <Route path="/admin/sessions/members/add" element={<PageWrapper><P7_3_AdminMemberRegister onRegister={(data) => {
              const sessionYear = selectedSession?.year || tempSession.year || new Date().getFullYear().toString();
              const initialCode = selectedSession?.code || tempSession.code || `DND${sessionYear}`;
              const newMember = { ...data, id: Math.random().toString(36).substr(2, 9), isAvailable: true, loginCode: initialCode, isFirstLogin: true };
              if (selectedSession) {
                const updatedSession = { ...selectedSession, members: [...selectedSession.members, newMember] };
                setSelectedSession(updatedSession);
                navigate('/admin/sessions/edit');
              } else {
                setTempMembers(prev => [...prev, newMember]);
                navigate('/admin/sessions/members');
              }
            }} onBack={() => navigate(selectedSession ? '/admin/sessions/edit' : '/admin/sessions/members')} showToast={showToast} /></PageWrapper>} />
            
            <Route path="/admin/sessions/detail" element={<PageWrapper>
              {selectedSession && (
                <P7_4_AdminFeedbackDetail 
                  session={selectedSession} 
                  onEdit={() => navigate('/admin/sessions/edit')} 
                  onDelete={async (id) => {
                    try {
                      const response = await api.authenticatedFetch(`/feedback/api/sessions/${id}`, token, { method: 'DELETE' });
                      if (response.ok) {
                        await refreshSessions();
                        showToast('삭제되었습니다.', 'success');
                        navigate('/admin/sessions');
                      }
                    } catch { showToast('삭제 중 오류가 발생했습니다.', 'warning'); }
                  }}
                  onResetCode={async (memberId) => {
                    if (!selectedSession) return;
                    try {
                      const response = await api.authenticatedFetch('/feedback/api/members/reset', token, {
                        method: 'POST',
                        body: JSON.stringify({ sessionId: selectedSession.id, memberId })
                      });
                      if (response.ok) {
                        await refreshSessions();
                        showToast('비밀번호가 초기화되었습니다.', 'success');
                      }
                    } catch { showToast('초기화 중 오류가 발생했습니다.', 'warning'); }
                  }} 
                  onBack={() => navigate('/admin/sessions')} 
                />
              )}
            </PageWrapper>} />
            
            <Route path="/admin/sessions/edit" element={<PageWrapper>
              {selectedSession && (
                <P7_5_AdminFeedbackEdit 
                  session={selectedSession} 
                  onSave={async (updated) => { 
                    try {
                      const response = await api.authenticatedFetch(`/feedback/api/sessions/${updated.id}`, token, {
                        method: 'PUT',
                        body: JSON.stringify(updated)
                      });
                      if (response.ok) {
                        await refreshSessions();
                        navigate('/admin/sessions/detail');
                      }
                    } catch { showToast('저장 중 오류가 발생했습니다.', 'warning'); }
                  }} 
                  onAddMember={(currentPeriod, currentMembers) => {
                    setSelectedSession({ ...selectedSession, period: currentPeriod, members: currentMembers });
                    navigate('/admin/sessions/members/add');
                  }}
                  onDeleteMember={async (id) => {
                    try {
                      const response = await api.authenticatedFetch(`/feedback/api/sessions/${selectedSession.id}/members/${id}`, token, { method: 'DELETE' });
                      if (response.ok) await refreshSessions();
                    } catch { showToast('삭제 중 오류가 발생했습니다.', 'warning'); }
                  }}
                  onBack={() => navigate('/admin/sessions/detail')} 
                  showToast={showToast} 
                />
              )}
            </PageWrapper>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        {toastMessage && <Toast message={toastMessage} type={toastType} />}
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter basename="/feedback">
    <AppRoutes />
  </BrowserRouter>
);

export default App;
