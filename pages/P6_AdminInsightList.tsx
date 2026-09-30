
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FeedbackSession } from '../types';
import { createReportWorkbook, addReportSheet, downloadWorkbook } from '../utils/exportExcel';

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

  const handleDownloadYearInsights = async (year: string) => {
    try {
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

      const workbook = createReportWorkbook();

      // Sheet 1: 인사이트 평가 내역
      addReportSheet(workbook, {
        name: "인사이트 평가",
        columns: [
          { header: '연도', key: '연도', width: 12 },
          { header: '번호', key: '번호', width: 10 },
          { header: '인사이트 내용', key: '인사이트 내용', width: 85 },
          { header: '구분', key: '구분', width: 18 }
        ],
        rows: insightRows
      });

      // Sheet 2: 대상 사원 목록 (있는 경우)
      if (allMembers.length > 0) {
        const memberMap = new Map<string, any>();
        allMembers.forEach(m => {
          if (m && m.id && !memberMap.has(m.id)) memberMap.set(m.id, m);
        });
        const uniqueMembers = Array.from(memberMap.values()).sort((a, b) => {
          const teamA = (a.team || '').trim();
          const teamB = (b.team || '').trim();
          if (teamA !== teamB) return teamA.localeCompare(teamB);
          const nameA = (a.name || '').trim();
          const nameB = (b.name || '').trim();
          return nameA.localeCompare(nameB);
        });
        const memberRows = uniqueMembers.map((m, idx) => ({
          '연도': `${year}년`,
          '번호': idx + 1,
          '소속팀': m.team || '',
          '사원명': m.name || ''
        }));
        addReportSheet(workbook, {
          name: "평가 대상 사원",
          columns: [
            { header: '연도', key: '연도', width: 12 },
            { header: '번호', key: '번호', width: 10 },
            { header: '소속팀', key: '소속팀', width: 18 },
            { header: '사원명', key: '사원명', width: 16 }
          ],
          rows: memberRows
        });
      }

      await downloadWorkbook(workbook, `${year}년_인사이트_평가_전체.xlsx`);
    } catch (e) {
      console.error('인사이트 전체 다운로드 오류:', e);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
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
                  {insights.length > 0 && (
                    <div className="pb-1">
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
                  )}

                  {insights.map((insight, i) => (
                    <div 
                      key={i} 
                      className="p-6 rounded-[24px] bg-surface-dark border border-theme shadow-sm"
                    >
                      <p className="text-[15px] leading-relaxed text-theme-main opacity-80 break-all whitespace-pre-wrap max-h-[285px] overflow-y-auto overscroll-contain custom-scrollbar">
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
