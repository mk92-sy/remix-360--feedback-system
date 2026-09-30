
import React, { useRef, useState } from 'react';
import Layout from '../components/Layout';
import { Member } from '../types';
import { createReportWorkbook, addReportSheet, downloadWorkbook } from '../utils/exportExcel';

interface P5_2AdminMemberDetailProps {
  member: Member | null;
  year: string;
  feedbackData: { 
    good: string; 
    suggestions: string; 
    rehire?: boolean;
    workRehire?: '좋아요' | '그저그래요' | '싫어요';
    personalRehire?: '좋아요' | '그저그래요' | '싫어요';
  }[] | null;
  onBack: () => void;
}

const P5_2_AdminMemberDetail: React.FC<P5_2AdminMemberDetailProps> = ({ member, year, feedbackData, onBack }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const goodPoints = feedbackData ? feedbackData.map(f => f.good).filter(Boolean) : [];
  const suggestions = feedbackData ? feedbackData.map(f => f.suggestions).filter(Boolean) : [];
  
  // 업무적 협업 집계
  const workLikes = feedbackData ? feedbackData.filter(f => f.workRehire === '좋아요' || (!f.workRehire && f.rehire === true)).length : 0;
  const workNeutral = feedbackData ? feedbackData.filter(f => f.workRehire === '그저그래요').length : 0;
  const workDislikes = feedbackData ? feedbackData.filter(f => f.workRehire === '싫어요' || (!f.workRehire && f.rehire === false)).length : 0;

  // 인성/태도 협업 집계
  const personalLikes = feedbackData ? feedbackData.filter(f => f.personalRehire === '좋아요' || (!f.personalRehire && f.rehire === true)).length : 0;
  const personalNeutral = feedbackData ? feedbackData.filter(f => f.personalRehire === '그저그래요').length : 0;
  const personalDislikes = feedbackData ? feedbackData.filter(f => f.personalRehire === '싫어요' || (!f.personalRehire && f.rehire === false)).length : 0;
  
  const handleExport = async (format: 'png' | 'pdf' | 'excel') => {
    if (!captureRef.current && format !== 'excel') return;
    setShowExportModal(false);

    if (format === 'excel') {
      const data = [];
      const maxLen = Math.max(goodPoints.length, suggestions.length);
      for (let i = 0; i < maxLen; i++) {
        data.push({
          '연도': `${year}년`,
          '소속팀': member?.team || '',
          '사원명': member?.name || '',
          '좋은점': goodPoints[i] || '',
          '바라는점': suggestions[i] || ''
        });
      }
      if (data.length === 0) {
        data.push({
          '연도': `${year}년`,
          '소속팀': member?.team || '',
          '사원명': member?.name || '',
          '좋은점': '작성된 피드백 없음',
          '바라는점': '작성된 피드백 없음'
        });
      }
      const workbook = createReportWorkbook();
      addReportSheet(workbook, {
        name: `${member?.name || '사원'}_피드백`,
        columns: [
          { header: '연도', key: '연도', width: 14 },
          { header: '소속팀', key: '소속팀', width: 18 },
          { header: '사원명', key: '사원명', width: 16 },
          { header: '좋은점', key: '좋은점', width: 65 },
          { header: '바라는점', key: '바라는점', width: 65 }
        ],
        rows: data,
        mergeColumns: ['연도', '소속팀', '사원명']
      });
      await downloadWorkbook(workbook, `${year}년_${member?.name || '사원'}_360도_피드백.xlsx`);
      return;
    }

    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-app').trim();
    // @ts-expect-error - html2canvas is loaded via script tag
    const canvas = await window.html2canvas(captureRef.current, { backgroundColor: bgColor, scale: 2, useCORS: true });
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `feedback_${member?.name || 'employee'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      // @ts-expect-error - jspdf is loaded via script tag
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const contentPdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [pdfWidth, pdfHeight] });
      contentPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      contentPdf.save(`feedback_${member?.name || 'employee'}.pdf`);
    }
  };

  return (
    <Layout 
      title="360º 피드백" 
      onBack={onBack}
      footer={
        <div className="flex gap-3 w-full">
          <button onClick={onBack} className="flex-1 py-4 bg-surface-dark text-theme-main font-bold border border-theme rounded-2xl active:scale-95 transition-all">뒤로가기</button>
          <button onClick={() => setShowExportModal(true)} className="flex-1 py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all shadow-xl">공유하기</button>
        </div>
      }
    >
      <div ref={captureRef} className="bg-background-dark min-h-full transition-colors duration-500">
        <div className="flex flex-col items-center px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-dark border border-theme mb-6 shadow-sm"><span className="text-[14px] font-bold text-theme-main">{member?.name}</span></div>
          <div className="text-[20px] font-black text-theme-main mb-2 tracking-tight opacity-80">{year}년</div>
          <h2 className="text-[28px] font-bold leading-tight text-theme-main mb-2">직원 역량 향상을 위한<br/>360º 피드백</h2>
        </div>
        <div className="px-5 space-y-10 pb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-accent/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-accent">handshake</span>
              </div>
              <p className="text-[20px] font-bold text-theme-main">재협업 희망 여부</p>
            </div>
            
            <div className="space-y-3">
              {/* 업무적 협업 */}
              <div className="p-5 rounded-[20px] bg-surface-dark border border-theme shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-theme-main flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-accent text-[18px]">business_center</span>
                    업무적 협업
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-theme/40">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-theme-highlight/40">
                    <span className="material-symbols-outlined text-blue-400 text-[22px]">sentiment_satisfied</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-theme-sub font-medium">좋아요</span>
                      <span className="text-[16px] font-extrabold text-blue-400">{workLikes}명</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-theme-highlight/40">
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">sentiment_neutral</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-theme-sub font-medium">그저그래요</span>
                      <span className="text-[16px] font-extrabold text-slate-400">{workNeutral}명</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-theme-highlight/40">
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">sentiment_dissatisfied</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-theme-sub font-medium">싫어요</span>
                      <span className="text-[16px] font-extrabold text-slate-400">{workDislikes}명</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 태도 및 소통 협업 */}
              <div className="p-5 rounded-[20px] bg-surface-dark border border-theme shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-theme-main flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-accent text-[18px]">favorite</span>
                    태도 및 소통 협업
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-theme/40">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-theme-highlight/40">
                    <span className="material-symbols-outlined text-blue-400 text-[22px]">sentiment_satisfied</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-theme-sub font-medium">좋아요</span>
                      <span className="text-[16px] font-extrabold text-blue-400">{personalLikes}명</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-theme-highlight/40">
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">sentiment_neutral</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-theme-sub font-medium">그저그래요</span>
                      <span className="text-[16px] font-extrabold text-slate-400">{personalNeutral}명</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-theme-highlight/40">
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">sentiment_dissatisfied</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-theme-sub font-medium">싫어요</span>
                      <span className="text-[16px] font-extrabold text-slate-400">{personalDislikes}명</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-blue-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-[18px] text-blue-500">thumb_up</span></div>
              <p className="text-[20px] font-bold text-theme-main">좋은점</p>
              <div className="px-2 py-0.5 rounded-md bg-theme-highlight text-[13px] text-theme-sub font-medium">{goodPoints.length}개</div>
            </div>
            <div className="space-y-3">
              {goodPoints.length > 0 ? goodPoints.map((text, i) => (
                <div key={i} className="p-6 rounded-[20px] bg-surface-dark border border-theme text-[15px] leading-relaxed text-theme-main opacity-90 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 break-all whitespace-pre-wrap max-h-[285px] overflow-y-auto overscroll-auto custom-scrollbar">{text}</div>
              )) : <div className="p-10 rounded-2xl bg-surface-dark/50 border border-dashed border-theme text-center text-theme-sub text-sm">피드백 내용이 없습니다.</div>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-orange-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-[18px] text-orange-500">lightbulb</span></div>
              <p className="text-[20px] font-bold text-theme-main">바라는점</p>
              <div className="px-2 py-0.5 rounded-md bg-theme-highlight text-[13px] text-theme-sub font-medium">{suggestions.length}개</div>
            </div>
            <div className="space-y-3">
              {suggestions.length > 0 ? suggestions.map((text, i) => (
                <div key={i} className="p-6 rounded-[20px] bg-surface-dark border border-theme text-[15px] leading-relaxed text-theme-main opacity-90 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 break-all whitespace-pre-wrap max-h-[285px] overflow-y-auto overscroll-auto custom-scrollbar">{text}</div>
              )) : <div className="p-10 rounded-2xl bg-surface-dark/50 border border-dashed border-theme text-center text-theme-sub text-sm">피드백 내용이 없습니다.</div>}
            </div>
          </div>
        </div>
      </div>
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={() => setShowExportModal(false)} />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="text-[20px] font-bold text-theme-main mb-6">피드백 공유하기</h3>
              <div className="mb-6">
                <button 
                  onClick={() => handleExport('excel')} 
                  className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl bg-accent text-white font-bold text-[15px] active:scale-95 transition-all shadow-lg hover:brightness-110 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[24px]">table_view</span>
                  <span>Excel 파일로 다운로드</span>
                </button>
              </div>
              <button onClick={() => setShowExportModal(false)} className="w-full py-3.5 bg-background-dark text-theme-sub border border-theme font-bold rounded-2xl active:scale-95 transition-all text-[15px] cursor-pointer">취소</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P5_2_AdminMemberDetail;
