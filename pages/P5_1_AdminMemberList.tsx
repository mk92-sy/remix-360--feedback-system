
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { Member, FeedbackSession } from '../types';

interface P5_1AdminMemberListProps {
  sessions: FeedbackSession[];
  onMemberSelect: (member: Member, year: string) => void;
  onBack: () => void;
}

const P5_1_AdminMemberList: React.FC<P5_1AdminMemberListProps> = ({ sessions, onMemberSelect, onBack }) => {
  const years = Array.from(new Set<string>(sessions.map(s => s.year))).sort((a, b) => b.localeCompare(a));
  
  const [openYear, setOpenYear] = useState<string | null>(years[0] || null);
  const [openTeams, setOpenTeams] = useState<Record<string, string | null>>({});

  const toggleYear = (year: string) => {
    setOpenYear(prev => (prev === year ? null : year));
  };

  const toggleTeam = (year: string, team: string) => {
    setOpenTeams(prev => ({
      ...prev,
      [year]: prev[year] === team ? null : team
    }));
  };

  const handleDownloadYearFeedbacks = (year: string) => {
    const matchingSessions = sessions.filter(s => s.year === year);
    if (matchingSessions.length === 0) return;

    // Collect all unique members and feedbacks for this year
    const allMembersMap = new Map<string, Member>();
    const allFeedbacksMap: Record<string, { good: string; suggestions: string; rehire?: boolean }[]> = {};

    matchingSessions.forEach(session => {
      session.members.forEach(m => {
        if (!allMembersMap.has(m.id)) {
          allMembersMap.set(m.id, m);
        }
      });
      if (session.feedbacks) {
        Object.entries(session.feedbacks).forEach(([mId, fbList]) => {
          if (!allFeedbacksMap[mId]) allFeedbacksMap[mId] = [];
          allFeedbacksMap[mId].push(...fbList);
        });
      }
    });

    const sortedMembers = Array.from(allMembersMap.values()).sort((a, b) => {
      if (a.team !== b.team) return a.team.localeCompare(b.team);
      return a.name.localeCompare(b.name);
    });

    const detailRows: any[] = [];
    const summaryRows: any[] = [];

    sortedMembers.forEach(member => {
      const memberFeedbacks = allFeedbacksMap[member.id] || [];
      const rehireFeedbacks = memberFeedbacks.filter(f => f.rehire !== undefined);
      const rehireLikes = rehireFeedbacks.filter(f => f.rehire === true).length;
      const rehireDislikes = rehireFeedbacks.filter(f => f.rehire === false).length;
      const rehireRate = rehireFeedbacks.length > 0 
        ? `${Math.round((rehireLikes / rehireFeedbacks.length) * 100)}%` 
        : '-';

      // Summary row for this member
      summaryRows.push({
        '연도': `${year}년`,
        '소속팀': member.team,
        '사원명': member.name,
        '총 피드백 수': memberFeedbacks.length,
        '재협업 희망(좋아요)': rehireLikes,
        '재협업 비희망(아니요)': rehireDislikes,
        '재협업 희망률': rehireRate,
        '좋은점 요약': memberFeedbacks.map((f, i) => `${i + 1}. ${f.good}`).filter(Boolean).join('\n') || '작성된 내용 없음',
        '바라는점 요약': memberFeedbacks.map((f, i) => `${i + 1}. ${f.suggestions}`).filter(Boolean).join('\n') || '작성된 내용 없음'
      });

      // Individual item detail rows
      if (memberFeedbacks.length > 0) {
        memberFeedbacks.forEach((fb, idx) => {
          detailRows.push({
            '연도': `${year}년`,
            '소속팀': member.team,
            '사원명': member.name,
            '피드백 번호': idx + 1,
            '재협업 희망 여부': fb.rehire === true ? '좋아요' : fb.rehire === false ? '아니요' : '-',
            '좋은점': fb.good || '',
            '바라는점': fb.suggestions || ''
          });
        });
      } else {
        detailRows.push({
          '연도': `${year}년`,
          '소속팀': member.team,
          '사원명': member.name,
          '피드백 번호': '-',
          '재협업 희망 여부': '-',
          '좋은점': '작성된 피드백 없음',
          '바라는점': '작성된 피드백 없음'
        });
      }
    });

    const workbook = XLSX.utils.book_new();

    // Sheet 1: 상세 피드백 내역 (개인별 피드백 항목 모두 반영)
    const detailWorksheet = XLSX.utils.json_to_sheet(detailRows);
    detailWorksheet['!cols'] = [
      { wch: 10 }, // 연도
      { wch: 16 }, // 소속팀
      { wch: 14 }, // 사원명
      { wch: 12 }, // 피드백 번호
      { wch: 18 }, // 재협업 희망 여부
      { wch: 55 }, // 좋은점
      { wch: 55 }  // 바라는점
    ];
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, "360 피드백 상세");

    // Sheet 2: 사원별 요약 현황
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
    summaryWorksheet['!cols'] = [
      { wch: 10 }, // 연도
      { wch: 16 }, // 소속팀
      { wch: 14 }, // 사원명
      { wch: 14 }, // 총 피드백 수
      { wch: 20 }, // 재협업 희망(좋아요)
      { wch: 22 }, // 재협업 비희망(아니요)
      { wch: 15 }, // 재협업 희망률
      { wch: 60 }, // 좋은점 요약
      { wch: 60 }  // 바라는점 요약
    ];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "사원별 요약");

    XLSX.writeFile(workbook, `${year}년_360도_다면피드백_전체.xlsx`);
  };

  return (
    <Layout 
      title="360º 다면 피드백" 
      onBack={onBack}
      footer={
        <button 
          onClick={onBack}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg shadow-xl active:scale-[0.98]"
        >
          처음화면으로
        </button>
      }
    >
      <div className="px-6 pt-10 pb-10 text-theme-main">
        <h2 className="text-[22px] font-bold leading-tight mb-3">
          직원 역량 향상을 위한<br/>360º 피드백
        </h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">
          확인하고 싶은 직원을 눌러주세요.
        </p>
      </div>

      <div className="px-5 space-y-6 pb-20">
        {years.map(year => {
          const sessionInYear = sessions.find(s => s.year === year);
          if (!sessionInYear) return null;
          
          const teams = Array.from(new Set<string>(sessionInYear.members.map(m => m.team)));

          return (
            <div key={year} className="space-y-4">
              <button 
                onClick={() => toggleYear(year)}
                className="w-full flex items-center justify-between py-4 border-b border-theme group active:opacity-70 transition-all"
              >
                <h3 className="text-[22px] font-extrabold text-theme-main">{year}년</h3>
                <span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${openYear === year ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {openYear === year && teams.length > 0 && (
                <div className="bg-surface-dark border border-theme rounded-[28px] px-[10px] py-[15px] space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {teams.map(team => {
                    const isOpen = openTeams[year] === team;
                    return (
                      <div key={team} className="w-full">
                        <button 
                          onClick={() => toggleTeam(year, team)}
                          className={`w-full flex items-center justify-between px-2 h-[52px] active:opacity-70 transition-all border-b ${isOpen ? 'border-theme' : 'border-transparent'}`}
                        >
                          <h4 className="text-[17px] font-bold text-theme-main">{team}</h4>
                          <span className={`material-symbols-outlined text-theme-sub text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        {isOpen && (
                          <div className="grid grid-cols-3 gap-2 animate-in fade-in zoom-in-95 duration-200 px-1 pt-4 pb-6">
                            {sessionInYear.members
                              .filter(m => m.team === team)
                              .map(member => {
                                const feedbackCount = sessionInYear.feedbacks?.[member.id]?.length || 0;
                                return (
                                  <button
                                    key={member.id}
                                    onClick={() => onMemberSelect(member, year)}
                                    className="relative flex items-center justify-center py-3.5 px-2 rounded-xl text-[14px] font-bold transition-all bg-background-dark border border-theme text-theme-main hover:border-accent/40 active:scale-95 shadow-sm cursor-pointer"
                                  >
                                    <span className="truncate">{member.name}</span>
                                    {feedbackCount > 0 && (
                                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-black shadow-sm">
                                        {feedbackCount}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-3 px-1 pb-1">
                    <button
                      onClick={() => handleDownloadYearFeedbacks(year)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-theme-highlight hover:bg-accent hover:text-white border border-theme text-theme-main font-bold text-[14px] transition-all active:scale-[0.98] shadow-sm cursor-pointer group"
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
        {years.length === 0 && <p className="text-center text-theme-sub py-10">등록된 세션이 없습니다.</p>}
      </div>
    </Layout>
  );
};

export default P5_1_AdminMemberList;
