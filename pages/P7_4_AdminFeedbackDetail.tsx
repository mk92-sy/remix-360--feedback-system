
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FeedbackSession } from '../types';

interface P7_4AdminFeedbackDetailProps {
  session: FeedbackSession | null;
  onEdit: () => void;
  onDelete: (sessionId: string) => void;
  onResetCode: (sessionId: string, memberId: string) => void;
  onBack: () => void;
}

const P7_4_AdminFeedbackDetail: React.FC<P7_4AdminFeedbackDetailProps> = ({ session, onEdit, onDelete, onResetCode, onBack }) => {
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({ '기획팀 (Planning Team)': true });
  const [resettingMemberId, setResettingMemberId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!session) return null;

  const getStatusText = () => {
    if (!session.period) return '-';
    const [startStr, endStr] = session.period.split(' - ');
    const now = new Date();
    const start = new Date(startStr.replace(/\./g, '-'));
    const end = new Date(endStr.replace(/\./g, '-'));
    end.setHours(23, 59, 59, 999);
    if (now < start) return '예정';
    if (now > end) return '완료';
    return '작업중';
  };

  const statusText = getStatusText();
  const membersByTeam = session.members.reduce((acc, member) => {
    if (!acc[member.team]) acc[member.team] = [];
    acc[member.team].push(member);
    return acc;
  }, {} as Record<string, any[]>);

  const teamList = Object.keys(membersByTeam);
  const toggleTeam = (team: string) => {
    setOpenTeams(prev => ({ ...prev, [team]: !prev[team] }));
  };

  const handleResetClick = (memberId: string) => {
    setResettingMemberId(memberId);
  };

  const confirmReset = () => {
    if (resettingMemberId) {
      onResetCode(session.id, resettingMemberId);
      setResettingMemberId(null);
    }
  };

  const is360Feedback = session.type === '360도 다면 피드백';
  const displayType = is360Feedback ? '360도 다면평가' : '인사이트 평가';

  return (
    <Layout 
      title={`${session.year}년 ${is360Feedback ? '다면피드백' : '인사이트 피드백'} 상세 정보`} 
      onBack={onBack}
      footer={
        <div className="flex gap-3">
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 h-[56px] bg-background-dark border border-theme text-theme-main font-bold rounded-2xl text-[16px] active:scale-[0.98] transition-all"
          >
            삭제하기
          </button>
          <button 
            onClick={onEdit}
            className="flex-1 h-[56px] bg-accent text-white font-bold rounded-2xl text-[16px] shadow-xl active:scale-[0.98] transition-all"
          >
            수정하기
          </button>
        </div>
      }
    >
      <div className="px-6 pt-10 pb-8 space-y-10">
        <div className="bg-surface-dark border border-theme rounded-[20px] overflow-hidden shadow-lg transition-colors duration-500">
          {[
            { label: '생성할 년도', value: `${session.year}년` },
            { label: '피드백 목록', value: displayType },
            { label: '오픈 기간', value: session.period },
            { label: '피드백 상태', value: statusText },
          ].map((item, idx, arr) => (
            <div key={item.label} className={`grid grid-cols-[110px_1fr] h-[64px] ${idx !== arr.length - 1 ? 'border-b border-theme' : ''}`}>
              <div className="flex items-center px-5 bg-theme-highlight text-[15px] text-theme-sub font-bold border-r border-theme">
                {item.label}
              </div>
              <div className="flex items-center px-5 text-[17px] font-bold text-theme-main opacity-90">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pb-10">
          {teamList.map((team) => {
            const isOpen = openTeams[team];
            const displayTeamName = team.split(' (')[0];
            return (
              <div key={team} className="bg-surface-dark border border-theme rounded-[20px] overflow-hidden transition-all duration-300">
                <button onClick={() => toggleTeam(team)} className="w-full flex items-center justify-between px-6 py-5 active:bg-theme-highlight transition-colors">
                  <span className="text-[17px] font-bold text-theme-main">{displayTeamName}</span>
                  <span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-3">
                      {membersByTeam[team].map((m) => (
                        <div key={m.id} className="flex justify-between items-center py-1">
                          <span className="text-[15px] text-theme-sub font-medium">{m.name}</span>
                          <button 
                            onClick={() => handleResetClick(m.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-theme-highlight border border-theme text-theme-sub hover:bg-theme-highlight transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                            <span className="text-[12px] font-bold">초기화</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {resettingMemberId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm" onClick={() => setResettingMemberId(null)} />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">비밀번호 초기화</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              해당 직원의 비밀번호를<br/>초기 코드로 변경하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResettingMemberId(null)} className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소</button>
              <button onClick={confirmReset} className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all text-[15px]">초기화</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">피드백 삭제</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              이 피드백 세션을 삭제하시겠습니까?<br/>
              <span className="text-red-500 text-[13px]">삭제 시 모든 데이터가 영구 삭제됩니다.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소</button>
              <button 
                onClick={() => {
                  onDelete(session.id);
                  setIsDeleteModalOpen(false);
                }} 
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P7_4_AdminFeedbackDetail;
