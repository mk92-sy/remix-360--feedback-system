
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FeedbackSession } from '../types';

interface P7AdminFeedbackListProps {
  sessions: FeedbackSession[];
  onSelectSession: (session: FeedbackSession) => void;
  onRegister: () => void;
  onBack: () => void;
}

const P7_AdminFeedbackList: React.FC<P7AdminFeedbackListProps> = ({ sessions, onSelectSession, onRegister, onBack }) => {
  const [open360, setOpen360] = useState(true);
  const [openInsight, setOpenInsight] = useState(true);

  const fb360 = sessions
    .filter(s => s.type === '360도 다면 피드백')
    .sort((a, b) => b.year.localeCompare(a.year));
  const insight = sessions
    .filter(s => s.type === '인사이트 피드백')
    .sort((a, b) => b.year.localeCompare(a.year));

  return (
    <Layout 
      title="피드백 관리하기" 
      onBack={onBack}
      footer={
        <button 
          onClick={onRegister}
          className="w-full h-[56px] bg-accent text-white font-bold rounded-2xl text-[16px] shadow-xl active:scale-[0.98] transition-all"
        >
          등록하기
        </button>
      }
    >
      <div className="px-6 pt-10 pb-8">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">
          피드백 관리하기
        </h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">
          피드백 항목들을 관리해주세요
        </p>
      </div>

      <div className="px-5 space-y-10 pb-20">
        <div className="space-y-4">
          <button 
            onClick={() => setOpen360(!open360)}
            className="w-full flex items-center justify-between py-2 border-b border-theme group"
          >
            <h3 className="text-[20px] font-bold text-theme-main">360도 피드백</h3>
            <span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${open360 ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {open360 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              {fb360.map(session => (
                <div 
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="flex items-center justify-between p-6 bg-surface-dark border border-theme rounded-[24px] cursor-pointer active:scale-[0.98] transition-all hover:bg-accent/5"
                >
                  <span className="text-[17px] font-bold text-theme-main opacity-80">
                    {session.year}년 다면피드백
                  </span>
                </div>
              ))}
              {fb360.length === 0 && <p className="text-sm text-theme-sub py-4 text-center italic opacity-40">등록된 항목이 없습니다.</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setOpenInsight(!openInsight)}
            className="w-full flex items-center justify-between py-2 border-b border-theme group"
          >
            <h3 className="text-[20px] font-bold text-theme-main">인사이트 피드백</h3>
            <span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${openInsight ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          
          {openInsight && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              {insight.map(session => (
                <div 
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="flex items-center justify-between p-6 bg-surface-dark border border-theme rounded-[24px] cursor-pointer active:scale-[0.98] transition-all hover:bg-accent/5"
                >
                  <span className="text-[17px] font-bold text-theme-main opacity-80">
                    {session.year}년 인사이트 피드백
                  </span>
                </div>
              ))}
              {insight.length === 0 && <p className="text-sm text-theme-sub py-4 text-center italic opacity-40">등록된 항목이 없습니다.</p>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default P7_AdminFeedbackList;
