
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Member, FeedbackSession } from '../types';
import { createReportWorkbook, addReportSheet, downloadWorkbook } from '../utils/exportExcel';

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

  const handleDownloadYearFeedbacks = async (year: string) => {
    try {
      const matchingSessions = sessions.filter(s => s.year === year);
      if (matchingSessions.length === 0) {
        alert(`${year}년도 세션 데이터를 찾을 수 없습니다.`);
        return;
      }

      // Collect all unique members and feedbacks for this year
      const allMembersMap = new Map<string, Member>();
      const allFeedbacksMap: Record<string, { 
        good: string; 
        suggestions: string; 
        rehire?: boolean;
        workRehire?: '좋아요' | '그저그래요' | '싫어요';
        personalRehire?: '좋아요' | '그저그래요' | '싫어요';
      }[]> = {};

      matchingSessions.forEach(session => {
        (session.members || []).forEach(m => {
          if (m && m.id && !allMembersMap.has(m.id)) {
            allMembersMap.set(m.id, m);
          }
        });
        if (session.feedbacks) {
          Object.entries(session.feedbacks).forEach(([mId, fbList]) => {
            if (!allFeedbacksMap[mId]) allFeedbacksMap[mId] = [];
            if (Array.isArray(fbList)) {
              allFeedbacksMap[mId].push(...fbList);
            }
          });
        }
      });

      const sortedMembers = Array.from(allMembersMap.values()).sort((a, b) => {
        const teamA = (a.team || '').trim();
        const teamB = (b.team || '').trim();
        if (teamA !== teamB) return teamA.localeCompare(teamB);
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        return nameA.localeCompare(nameB);
      });

      const detailRows: any[] = [];
      const summaryRows: any[] = [];
      const mergeRowRanges: { rowNumber: number; fromCol: number; toCol: number }[] = [];

      sortedMembers.forEach(member => {
        const memberFeedbacks = allFeedbacksMap[member.id] || [];
        const participantCount = memberFeedbacks.length; // 피드백 번호의 총 합 = 참여 인원

        // 업무적 협업 집계
        const workLikes = memberFeedbacks.filter(f => f.workRehire === '좋아요' || (!f.workRehire && f.rehire === true)).length;
        const workNeutral = memberFeedbacks.filter(f => f.workRehire === '그저그래요').length;
        const workDislikes = memberFeedbacks.filter(f => f.workRehire === '싫어요' || (!f.workRehire && f.rehire === false)).length;

        // 태도 및 소통 협업 집계
        const personalLikes = memberFeedbacks.filter(f => f.personalRehire === '좋아요' || (!f.personalRehire && f.rehire === true)).length;
        const personalNeutral = memberFeedbacks.filter(f => f.personalRehire === '그저그래요').length;
        const personalDislikes = memberFeedbacks.filter(f => f.personalRehire === '싫어요' || (!f.personalRehire && f.rehire === false)).length;

        // 업무적 협업 비율 계산 (소수점 한자리 반올림)
        const workPctLikes = participantCount > 0 ? (Math.round((workLikes / participantCount) * 1000) / 10).toFixed(1) : '0.0';
        const workPctNeutral = participantCount > 0 ? (Math.round((workNeutral / participantCount) * 1000) / 10).toFixed(1) : '0.0';
        const workPctDislikes = participantCount > 0 ? (Math.round((workDislikes / participantCount) * 1000) / 10).toFixed(1) : '0.0';

        // 태도 및 소통 협업 비율 계산 (소수점 한자리 반올림)
        const personalPctLikes = participantCount > 0 ? (Math.round((personalLikes / participantCount) * 1000) / 10).toFixed(1) : '0.0';
        const personalPctNeutral = participantCount > 0 ? (Math.round((personalNeutral / participantCount) * 1000) / 10).toFixed(1) : '0.0';
        const personalPctDislikes = participantCount > 0 ? (Math.round((personalDislikes / participantCount) * 1000) / 10).toFixed(1) : '0.0';

        // Summary row for this member
        summaryRows.push({
          '연도': `${year}년`,
          '소속팀': member.team || '',
          '사원명': member.name || '',
          '참여 인원(총 피드백 수)': `${participantCount}명`,
          '업무적 협업(좋아요/그저그래요/싫어요)': `${workPctLikes}% / ${workPctNeutral}% / ${workPctDislikes}% (${workLikes}/${workNeutral}/${workDislikes})`,
          '태도 및 소통 협업(좋아요/그저그래요/싫어요)': `${personalPctLikes}% / ${personalPctNeutral}% / ${personalPctDislikes}% (${personalLikes}/${personalNeutral}/${personalDislikes})`,
          '좋은점 요약': memberFeedbacks.map((f, i) => `${i + 1}. ${f.good || ''}`).filter(Boolean).join('\n\n') || '작성된 내용 없음',
          '바라는점 요약': memberFeedbacks.map((f, i) => `${i + 1}. ${f.suggestions || ''}`).filter(Boolean).join('\n\n') || '작성된 내용 없음'
        });

        // Individual item detail rows
        if (memberFeedbacks.length > 0) {
          memberFeedbacks.forEach((fb, idx) => {
            const wText = fb.workRehire || (fb.rehire === true ? '좋아요' : fb.rehire === false ? '싫어요' : '-');
            const pText = fb.personalRehire || (fb.rehire === true ? '좋아요' : fb.rehire === false ? '싫어요' : '-');
            detailRows.push({
              '연도': `${year}년`,
              '소속팀': member.team || '',
              '사원명': member.name || '',
              '피드백 번호': idx + 1,
              '업무적 협업': wText,
              '태도 및 소통 협업': pText,
              '좋은점': fb.good || '',
              '바라는점': fb.suggestions || ''
            });
          });
        } else {
          detailRows.push({
            '연도': `${year}년`,
            '소속팀': member.team || '',
            '사원명': member.name || '',
            '피드백 번호': '-',
            '업무적 협업': '-',
            '태도 및 소통 협업': '-',
            '좋은점': '작성된 피드백 없음',
            '바라는점': '작성된 피드백 없음'
          });
        }

        // 사원별 마지막 피드백 아래에 재협업 결과 통합 집계 행 추가 (피드백 번호, 업무적 협업, 태도 및 소통 협업 셀 병합)
        // [재협업 결과 · 총 N명 참여] 문구는 제외하고, 비율(%)과 인원수 표시
        const combinedSummaryText = participantCount > 0
          ? `• 업무적 협업 : 좋아요 ${workPctLikes}%, 그저그래요 ${workPctNeutral}%, 싫어요 ${workPctDislikes}% (${workLikes}/${workNeutral}/${workDislikes})\n• 태도 및 소통 협업 : 좋아요 ${personalPctLikes}%, 그저그래요 ${personalPctNeutral}%, 싫어요 ${personalPctDislikes}% (${personalLikes}/${personalNeutral}/${personalDislikes})`
          : `• 업무적 협업 : 응답 없음\n• 태도 및 소통 협업 : 응답 없음`;

        detailRows.push({
          '연도': `${year}년`,
          '소속팀': member.team || '',
          '사원명': member.name || '',
          '피드백 번호': combinedSummaryText,
          '업무적 협업': '',
          '태도 및 소통 협업': '',
          '좋은점': `[${member.name} 님 총 ${participantCount}명 참여 완료]`,
          '바라는점': '-',
          _isGroupSummary: true
        });

        // 엑셀에서 헤더가 1행이므로 현재 행 번호는 detailRows.length + 1
        // col 4: '피드백 번호', col 5: '업무적 협업', col 6: '태도 및 소통 협업' 병합
        mergeRowRanges.push({
          rowNumber: detailRows.length + 1,
          fromCol: 4,
          toCol: 6
        });
      });

      if (detailRows.length === 0) {
        detailRows.push({
          '연도': `${year}년`,
          '소속팀': '-',
          '사원명': '-',
          '피드백 번호': '-',
          '업무적 협업': '-',
          '태도 및 소통 협업': '-',
          '좋은점': '등록된 사원 데이터가 없습니다.',
          '바라는점': '-'
        });
      }

      if (summaryRows.length === 0) {
        summaryRows.push({
          '연도': `${year}년`,
          '소속팀': '-',
          '사원명': '-',
          '참여 인원(총 피드백 수)': '0명',
          '업무적 협업(좋아요/그저그래요/싫어요)': '0 / 0 / 0',
          '태도 및 소통 협업(좋아요/그저그래요/싫어요)': '0 / 0 / 0',
          '좋은점 요약': '등록된 사원 데이터가 없습니다.',
          '바라는점 요약': '-'
        });
      }

      const workbook = createReportWorkbook();

      // Sheet 1: 상세 피드백 내역 (개인별 피드백 항목 + 하단 재협업 총 결과 가로 병합 집계 행 + 소속팀/사원명 필터)
      addReportSheet(workbook, {
        name: "360 피드백 상세",
        columns: [
          { header: '연도', key: '연도', width: 12 },
          { header: '소속팀', key: '소속팀', width: 20 },
          { header: '사원명', key: '사원명', width: 16 },
          { header: '피드백 번호', key: '피드백 번호', width: 18 },
          { header: '업무적 협업', key: '업무적 협업', width: 26 },
          { header: '태도 및 소통 협업', key: '태도 및 소통 협업', width: 26 },
          { header: '좋은점', key: '좋은점', width: 60 },
          { header: '바라는점', key: '바라는점', width: 60 }
        ],
        rows: detailRows,
        mergeRowRanges,
        autoFilter: { from: 'B1', to: `C${detailRows.length + 1}` }
      });

      // Sheet 2: 사원별 요약 현황
      addReportSheet(workbook, {
        name: "사원별 요약",
        columns: [
          { header: '연도', key: '연도', width: 12 },
          { header: '소속팀', key: '소속팀', width: 20 },
          { header: '사원명', key: '사원명', width: 16 },
          { header: '참여 인원(총 피드백 수)', key: '참여 인원(총 피드백 수)', width: 22 },
          { header: '업무적 협업(좋아요/그저그래요/싫어요)', key: '업무적 협업(좋아요/그저그래요/싫어요)', width: 34 },
          { header: '태도 및 소통 협업(좋아요/그저그래요/싫어요)', key: '태도 및 소통 협업(좋아요/그저그래요/싫어요)', width: 34 },
          { header: '좋은점 요약', key: '좋은점 요약', width: 65 },
          { header: '바라는점 요약', key: '바라는점 요약', width: 65 }
        ],
        rows: summaryRows,
        isSummary: true
      });

      await downloadWorkbook(workbook, `${year}년_360도_다면피드백_전체.xlsx`);
    } catch (error) {
      console.error('360 피드백 전체 다운로드 중 오류:', error);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
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
