
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FeedbackSession } from '../types';

interface P6AdminInsightListProps {
  sessions: FeedbackSession[];
  onBack: () => void;
}

const P6_AdminInsightList: React.FC<P6AdminInsightListProps> = ({ sessions, onBack }) => {
  const years = Array.from(new Set<string>(sessions.map(s => s.year))).sort((a, b) => b.localeCompare(a));
  const [openYear, setOpenYear] = useState<string | null>(years[0] || null);

  const toggleYear = (year: string) => {
    setOpenYear(prev => (prev === year ? null : year));
  };

  return (
    <Layout 
      title="인사이트 평가" 
      onBack={onBack}
      footer={
        <button 
          onClick={onBack}
          className="w-full py-4 bg-accent border border-theme text-white font-bold rounded-2xl active:scale-95 transition-all"
        >
          뒤로가기
        </button>
      }
    >
      <div className="px-6 pt-12 pb-10 text-center">
        <h2 className="text-[28px] font-bold leading-tight text-theme-main">
          회사·팀 성장을 위한<br/>인사이트
        </h2>
      </div>

      <div className="px-5 space-y-4 pb-16">
        {years.map(year => {
          const session = sessions.find(s => s.year === year);
          const insights = session?.insights || [];
          
          return (
            <div key={year} className="space-y-4">
              <button 
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between py-4 border-b border-theme group active:opacity-70 transition-all"
              >
                <h3 className="text-[20px] font-extrabold text-theme-main">{year}년</h3>
                <span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${openYear === year ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {openYear === year && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {insights.map((insight, i) => (
                    <div 
                      key={i} 
                      className="p-6 rounded-[24px] bg-surface-dark border border-theme shadow-sm"
                    >
                      <p className="text-[15px] leading-relaxed text-theme-main opacity-80">
                        {insight.content}
                      </p>
                    </div>
                  ))}
                  {insights.length === 0 && (
                    <div className="py-10 text-center text-theme-sub text-sm italic opacity-40">
                      등록된 인사이트가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {years.length === 0 && <p className="text-center text-theme-sub py-10">등록된 데이터가 없습니다.</p>}
      </div>
    </Layout>
  );
};

export default P6_AdminInsightList;
