
import React from 'react';
import Layout from '../components/Layout';

interface P4AdminDashboardProps {
  onGoToDashboard: () => void;
  onGoToAddFeedback: () => void;
  onGoToPasswordChange: () => void;
  onBack: () => void;
}

const P4_AdminDashboard: React.FC<P4AdminDashboardProps> = ({ 
  onGoToDashboard, 
  onGoToAddFeedback, 
  onGoToPasswordChange,
  onBack 
}) => {
  return (
    <Layout title="피드백 관리" onBack={onBack}>
      <div className="px-6 pt-10 pb-8">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">
          피드백 관리
        </h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">
          관리 할 피드백 유형을 선택해주세요.
        </p>
      </div>

      <div className="px-5 space-y-4">
        {/* 피드백 확인하기 */}
        <button 
          onClick={onGoToDashboard}
          className="w-full flex flex-col gap-5 p-8 rounded-[32px] bg-surface-dark border border-theme transition-all text-left group active:scale-[0.98] shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-theme-highlight flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[28px] font-light">visibility</span>
          </div>
          <div>
            <h3 className="text-[20px] font-bold mb-2 text-theme-main">피드백 확인하기</h3>
            <p className="text-[14px] text-theme-sub font-medium opacity-60">기존 피드백 데이터를 조회하고 분석합니다.</p>
          </div>
        </button>

        {/* 피드백 추가 및 관리하기 */}
        <button 
          onClick={onGoToAddFeedback}
          className="w-full flex flex-col gap-5 p-8 rounded-[32px] bg-surface-dark border border-theme transition-all text-left group active:scale-[0.98] shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-theme-highlight flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[28px] font-light">add</span>
          </div>
          <div>
            <h3 className="text-[20px] font-bold mb-2 text-theme-main">피드백 추가 및 관리하기</h3>
            <p className="text-[14px] text-theme-sub font-medium opacity-60">새로운 피드백 세션 생성 및 관리</p>
          </div>
        </button>

        {/* 관리자 비밀번호 변경 */}
        <button 
          onClick={onGoToPasswordChange}
          className="w-full flex items-center px-8 h-[76px] rounded-[24px] bg-surface-dark border border-theme transition-all text-left group active:scale-[0.98] shadow-sm"
        >
          <h3 className="text-[17px] font-bold text-theme-main">관리자 비밀번호 변경</h3>
        </button>
      </div>
    </Layout>
  );
};

export default P4_AdminDashboard;
