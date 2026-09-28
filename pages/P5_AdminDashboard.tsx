
import React from 'react';
import Layout from '../components/Layout';

interface P5AdminDashboardProps {
  onSelect360: () => void;
  onSelectInsight: () => void;
  onBack: () => void;
}

const P5_AdminDashboard: React.FC<P5AdminDashboardProps> = ({ 
  onSelect360, 
  onSelectInsight, 
  onBack 
}) => {
  return (
    <Layout title="피드백 확인하기" onBack={onBack}>
      <div className="px-6 pt-8 pb-6">
        <h2 className="text-[24px] font-bold leading-tight mb-2 text-theme-main">
          피드백 확인하기
        </h2>
        <p className="text-theme-sub text-[14px] font-medium opacity-70">
          확인할 피드백 유형을 선택해주세요.
        </p>
      </div>

      <div className="px-5 space-y-3">
        {/* 360도 다면피드백 */}
        <button 
          onClick={onSelect360}
          className="w-full flex flex-col gap-3 p-5 rounded-[28px] bg-surface-dark border border-white/5 transition-all text-left group active:scale-[0.98] shadow-lg"
        >
          <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[24px] font-light">groups</span>
          </div>
          <div>
            <h3 className="text-[18px] font-bold mb-1 text-theme-main">360도 다면피드백</h3>
            <p className="text-[13px] text-theme-sub font-medium opacity-60">구성원 피드백 및 다면 진단 결과 확인</p>
          </div>
        </button>

        {/* 인사이트 평가 */}
        <button 
          onClick={onSelectInsight}
          className="w-full flex flex-col gap-3 p-5 rounded-[28px] bg-surface-dark border border-white/5 transition-all text-left group active:scale-[0.98] shadow-lg"
        >
          <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[24px] font-light">monitoring</span>
          </div>
          <div>
            <h3 className="text-[18px] font-bold mb-1 text-theme-main">인사이트 평가</h3>
            <p className="text-[13px] text-theme-sub font-medium opacity-60">AI 기반의 인사이트 리포트 확인</p>
          </div>
        </button>
      </div>
    </Layout>
  );
};

export default P5_AdminDashboard;
