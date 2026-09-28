
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
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

  const handleDownloadYearInsights = (year: string) => {
    const matchingSessions = sessions.filter(s => s.year === year);
    if (matchingSessions.length === 0) return;

    const allInsights = matchingSessions.flatMap(s => s.insights || []);
    const allMembers = matchingSessions.flatMap(s => s.members || []);

    const insightRows = allInsights.map((insight, index) => ({
      '연도': `${year}년`,
      '번호': index + 1,
      '인사이트 내용': insight.content || '',
      '구분': `인사이트 #${index + 1}`
    }));

    if (insightRows.length === 0) {
      insightRows.push({
        '연도': `${year}년`,
        '번호': 1,
        '인사이트 내용': '등록된 인사이트가 없습니다.',
        '구분': '-'
      });
    }

    const workbook = XLSX.utils.book_new();

    // Sheet 1: 인사이트 평가 내역
    const worksheet = XLSX.utils.json_to_sheet(insightRows);
    worksheet['!cols'] = [
      { wch: 10 }, // 연도
      { wch: 10 }, // 번호
      { wch: 80 }, // 인사이트 내용
      { wch: 16 }  // 구분
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "인사이트 평가");

    // Sheet 2: 대상 사원 목록 (있는 경우)
    if (allMembers.length > 0) {
      const memberMap = new Map<string, any>();
      allMembers.forEach(m => {
        if (!memberMap.has(m.id)) memberMap.set(m.id, m);
      });
      const uniqueMembers = Array.from(memberMap.values()).sort((a, b) => {
        if (a.team !== b.team) return a.team.localeCompare(b.team);
        return a.name.localeCompare(b.name);
      });
      const memberRows = uniqueMembers.map((m, idx) => ({
        '연도': `${year}년`,
        '번호': idx + 1,
        '소속팀': m.team,
        '사원명': m.name
      }));
      const memberSheet = XLSX.utils.json_to_sheet(memberRows);
      memberSheet['!cols'] = [
        { wch: 10 },
        { wch: 10 },
        { wch: 16 },
        { wch: 14 }
      ];
      XLSX.utils.book_append_sheet(workbook, memberSheet, "평가 대상 사원");
    }

    XLSX.writeFile(workbook, `${year}년_인사이트_평가_전체.xlsx`);
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

                  <div className="pt-2">
                    <button
                      onClick={() => handleDownloadYearInsights(year)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-surface-dark hover:bg-accent hover:text-white border border-theme text-theme-main font-bold text-[14px] transition-all active:scale-[0.98] shadow-sm cursor-pointer group"
                    >
                      <span className="material-symbols-outlined text-[20px] text-accent group-hover:text-white transition-colors">
                        download
                      </span>
                      <span>전체 다운로드</span>
                    </button>
                  </div>
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
