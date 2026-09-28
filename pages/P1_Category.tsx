
import React from 'react';
import Layout from '../components/Layout';

interface P1CategoryProps {
  availableTypes: string[];
  onSelect360: () => void;
  onSelectInsight: () => void;
  onBack: () => void;
}

const P1_Category: React.FC<P1CategoryProps> = ({ availableTypes, onSelect360, onSelectInsight, onBack }) => {
  // 시스템에 등록된 세션 타입에 따라 노출 여부 결정
  const show360 = availableTypes.includes('360도 다면 피드백');
  const showInsight = availableTypes.includes('인사이트 피드백');

  return (
    <Layout title="평가 선택" onBack={onBack}>
      <div className="px-6 pt-8 pb-6">
        <h2 className="text-[20px] font-bold leading-tight mb-2 text-theme-main">어떤 피드백을<br/>진행하시겠습니까?</h2>
        <p className="text-theme-sub text-[14px]">진행할 피드백 유형을 선택해주세요.</p>
      </div>

      <div className="px-5 space-y-4">
        {show360 && (
          <button 
            onClick={onSelect360}
            className="w-full flex flex-col gap-5 p-6 rounded-3xl bg-surface-dark border border-theme hover:border-accent/20 transition-all text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-theme-highlight flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">groups</span>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-theme-main">360도 다면피드백</h3>
              <p className="text-sm text-theme-sub">동료들과 함께하는 다각도 피드백</p>
            </div>
          </button>
        )}

        {showInsight && (
          <button 
            onClick={onSelectInsight}
            className="w-full flex flex-col gap-5 p-6 rounded-3xl bg-surface-dark border border-theme hover:border-accent/20 transition-all text-left group active:scale-[0.98] shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-theme-highlight flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[28px]">tips_and_updates</span>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-theme-main">인사이트 피드백</h3>
              <p className="text-sm text-theme-sub">깊이 있는 성과 분석 및 제안</p>
            </div>
          </button>
        )}

        {!show360 && !showInsight && (
          <div className="py-20 text-center text-theme-sub opacity-40">
            진행 중인 피드백 세션이 없습니다.
          </div>
        )}

        <div className="mt-8 p-5 bg-surface-dark/50 rounded-2xl border border-theme flex items-center gap-3">
          <span className="material-symbols-outlined text-theme-sub text-[20px]">info</span>
          <p className="text-xs text-theme-sub leading-relaxed">
            피드백 기간 내에 성실히 응답해 주세요. 여러분의 참여가 조직의 발전에 큰 도움이 됩니다.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default P1_Category;
