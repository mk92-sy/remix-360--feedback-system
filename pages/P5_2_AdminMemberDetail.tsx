
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { Member } from '../types';

interface P5_2AdminMemberDetailProps {
  member: Member | null;
  year: string;
  feedbackData: { good: string, suggestions: string, rehire?: boolean }[] | null;
  onBack: () => void;
}

const P5_2_AdminMemberDetail: React.FC<P5_2AdminMemberDetailProps> = ({ member, year, feedbackData, onBack }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const goodPoints = feedbackData ? feedbackData.map(f => f.good).filter(Boolean) : [];
  const suggestions = feedbackData ? feedbackData.map(f => f.suggestions).filter(Boolean) : [];
  
  // Only count feedbacks that have a rehire value (true or false)
  // If rehire is undefined (old data), we don't count it in the total for the percentage
  const rehireFeedbacks = feedbackData ? feedbackData.filter(f => f.rehire !== undefined) : [];
  const rehireCount = rehireFeedbacks.filter(f => f.rehire === true).length;
  const dislikeCount = rehireFeedbacks.filter(f => f.rehire === false).length;
  
  const handleExport = async (format: 'png' | 'pdf' | 'excel') => {
    if (!captureRef.current && format !== 'excel') return;
    setShowExportModal(false);

    if (format === 'excel') {
      const data = [];
      const maxLen = Math.max(goodPoints.length, suggestions.length);
      for (let i = 0; i < maxLen; i++) {
        data.push({
          '좋은점': goodPoints[i] || '',
          '바라는점': suggestions[i] || '',
          '재협업 희망 여부': i === 0 ? `좋아요: ${rehireCount}, 아니요: ${dislikeCount}` : ''
        });
      }
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");
      XLSX.writeFile(workbook, `feedback_${member?.name || 'employee'}.xlsx`);
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
                <span className="material-symbols-outlined text-[18px] text-accent">group_add</span>
              </div>
              <p className="text-[20px] font-bold text-theme-main">재협업 희망 여부</p>
            </div>
            <div className="p-6 rounded-[20px] bg-surface-dark border border-theme flex items-center gap-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-accent text-[24px]">sentiment_satisfied</span>
                <div className="flex flex-col">
                  <span className="text-[12px] text-theme-sub font-medium">좋아요</span>
                  <span className="text-[18px] font-bold text-accent">{rehireCount}명</span>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-theme opacity-20" />
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-theme-sub text-[24px]">sentiment_dissatisfied</span>
                <div className="flex flex-col">
                  <span className="text-[12px] text-theme-sub font-medium">아니요</span>
                  <span className="text-[18px] font-bold text-theme-main">{dislikeCount}명</span>
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
                <div key={i} className="p-6 rounded-[20px] bg-surface-dark border border-theme text-[15px] leading-relaxed text-theme-main opacity-90 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">{text}</div>
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
                <div key={i} className="p-6 rounded-[20px] bg-surface-dark border border-theme text-[15px] leading-relaxed text-theme-main opacity-90 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">{text}</div>
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
              <h3 className="text-[20px] font-bold text-theme-main mb-8">공유 형식 선택</h3>
              <div className="grid grid-cols-3 gap-3 mb-8">
                <button onClick={() => handleExport('png')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-theme-highlight border border-theme hover:bg-accent hover:text-white active:scale-95 transition-all group">
                  <span className="material-symbols-outlined text-[28px]">image</span>
                  <span className="text-[12px] font-bold">PNG</span>
                </button>
                <button onClick={() => handleExport('pdf')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-theme-highlight border border-theme hover:bg-accent hover:text-white active:scale-95 transition-all group">
                  <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                  <span className="text-[12px] font-bold">PDF</span>
                </button>
                <button onClick={() => handleExport('excel')} className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-theme-highlight border border-theme hover:bg-accent hover:text-white active:scale-95 transition-all group">
                  <span className="material-symbols-outlined text-[28px]">table_view</span>
                  <span className="text-[12px] font-bold">Excel</span>
                </button>
              </div>
              <button onClick={() => setShowExportModal(false)} className="w-full py-4 bg-background-dark text-theme-sub border border-theme font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P5_2_AdminMemberDetail;
