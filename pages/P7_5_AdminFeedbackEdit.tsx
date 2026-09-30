
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { FeedbackSession, Member } from '../types';
import C3_CalendarModal from '../components/C3_CalendarModal';

interface P7_5AdminFeedbackEditProps {
  session: FeedbackSession | null;
  onSave: (session: FeedbackSession) => void;
  onAddMember: (period: string, members: Member[]) => void;
  onDeleteMember: (id: string) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'warning') => void;
}

const P7_5_AdminFeedbackEdit: React.FC<P7_5AdminFeedbackEditProps> = ({ session, onSave, onAddMember, onDeleteMember, onBack, showToast }) => {
  const [period, setPeriod] = useState(session?.period || '');
  const [status, setStatus] = useState<'진행중' | '완료'>(session?.status || '진행중');
  const [currentMembers, setCurrentMembers] = useState<Member[]>(session?.members || []);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({
    '기획팀 (Planning Team)': true,
    '디자인팀 (Design Team)': true,
    '퍼블팀 (Publishing Team)': true,
  });

  const [errors, setErrors] = useState<{ period?: boolean; }>({});

  useEffect(() => {
    if (session) {
      Promise.resolve().then(() => {
        setCurrentMembers(session.members);
        setPeriod(session.period);
        setStatus(session.status || '진행중');
      });
    }
  }, [session]);

  if (!session) return null;

  const is360Feedback = session.type === '360도 다면 피드백';

  const handleSave = () => {
    if (!period) { setErrors({ period: true }); showToast('오픈 기간을 선택해주세요.', 'warning'); setIsCalendarOpen(true); return; }
    
    // 오픈 기간이 변경되었는지 확인
    const isPeriodChanged = period !== session.period;
    // 오픈 기간이 변경되면 자동으로 '진행중'으로 상태 변경, 그렇지 않으면 사용자가 선택한 status 유지
    const finalStatus = isPeriodChanged ? '진행중' : status;

    onSave({ ...session, period, status: finalStatus, members: currentMembers });
    showToast('수정되었습니다.', 'success');
  };

  const handleCalendarSelect = (start: Date, end: Date) => {
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}.${m}.${d}`;
    };
    const newPeriod = `${formatDate(start)} - ${formatDate(end)}`;
    setPeriod(newPeriod);
    setErrors(prev => ({ ...prev, period: false }));
    // 오픈 기간 날짜가 변경되면 진행중으로 상태 변경
    setStatus('진행중');
  };

  const removeMember = (id: string) => {
    setCurrentMembers(prev => prev.filter(m => m.id !== id));
    onDeleteMember(id);
  };

  const toggleTeam = (team: string) => {
    setOpenTeams(prev => ({ ...prev, [team]: !prev[team] }));
  };

  return (
    <Layout 
      title="피드백 상세내용 수정하기" 
      onBack={onBack}
      footer={
        <div className="flex gap-3">
          <button onClick={() => onAddMember(period, currentMembers)} className="flex-1 h-[56px] bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-[0.98] transition-all">직원 추가하기</button>
          <button onClick={handleSave} className="flex-1 h-[56px] bg-accent text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all">수정완료</button>
        </div>
      }
    >
      <div className="px-6 pt-10 pb-4">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">피드백 상세내용 수정하기</h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">피드백 상세 내용을 수정해주세요.</p>
      </div>
      <div className="px-6 space-y-8 pb-10">
        {[
          { label: '생성할 년도', value: `${session.year}년`, readOnly: true },
          { label: '피드백 목록', value: is360Feedback ? '360도 다면평가' : '인사이트 평가', readOnly: true },
        ].map(item => (
          <div key={item.label} className="space-y-3">
            <label className="text-[15px] font-bold text-theme-main ml-1">{item.label}</label>
            <div className="relative">
              <input type="text" readOnly value={item.value} className="w-full h-[52px] bg-surface-dark border border-theme rounded-2xl px-5 text-theme-sub outline-none cursor-default opacity-60" />
            </div>
          </div>
        ))}
        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">오픈 기간 설정</label>
          <div className="relative" onClick={() => setIsCalendarOpen(true)}>
            <input type="text" readOnly value={period} placeholder="YYYY.MM.DD - YYYY.MM.DD" className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/30 focus:outline-none transition-all cursor-pointer ${errors.period ? 'border-red-500 ring-1 ring-red-500/50' : 'border-theme'}`} />
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none"><span className="material-symbols-outlined text-theme-sub text-[24px]">calendar_month</span></div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">피드백 상태</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('진행중')}
              className={`h-[52px] rounded-2xl font-bold text-[15px] border transition-all ${
                status === '진행중'
                  ? 'bg-accent text-white border-accent shadow-md'
                  : 'bg-surface-dark border-theme text-theme-sub hover:text-theme-main'
              }`}
            >
              진행중
            </button>
            <button
              type="button"
              onClick={() => setStatus('완료')}
              className={`h-[52px] rounded-2xl font-bold text-[15px] border transition-all ${
                status === '완료'
                  ? 'bg-accent text-white border-accent shadow-md'
                  : 'bg-surface-dark border-theme text-theme-sub hover:text-theme-main'
              }`}
            >
              완료
            </button>
          </div>
        </div>
        <div className="space-y-8 pt-4 pb-20">
          {['기획팀 (Planning Team)', '디자인팀 (Design Team)', '퍼블팀 (Publishing Team)'].map((teamName) => {
            const isOpen = openTeams[teamName];
            const teamMembers = currentMembers.filter(m => m.team === teamName);
            return (
              <div key={teamName} className="space-y-4">
                <button onClick={() => toggleTeam(teamName)} className="w-full flex items-center justify-between group"><h3 className="text-[18px] font-bold text-theme-main">{teamName}</h3><span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}>expand_less</span></button>
                {isOpen && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {teamMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 px-4 py-2.5 bg-theme-highlight border border-theme rounded-xl">
                        <span className="text-[14px] font-bold text-theme-main">{m.name}</span>
                        <button onClick={() => removeMember(m.id)} className="flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[16px]">close</span></button>
                      </div>
                    ))}
                    {teamMembers.length === 0 && <p className="text-sm text-theme-sub italic px-1 opacity-40">등록된 직원이 없습니다.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <C3_CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onSelect={handleCalendarSelect} initialStartDate={session.period ? new Date(session.period.split(' - ')[0].replace(/\./g, '-')) : undefined} initialEndDate={session.period ? new Date(session.period.split(' - ')[1].replace(/\./g, '-')) : undefined} />
    </Layout>
  );
};

export default P7_5_AdminFeedbackEdit;
