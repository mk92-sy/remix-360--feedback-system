
import React from 'react';
import Layout from '../components/Layout';

interface P2_1IntroProps {
  onNext: () => void;
  onBack: () => void;
}

const P2_1_Intro: React.FC<P2_1IntroProps> = ({ onNext, onBack }) => {
  return (
    <Layout 
      title="360º 다면 피드백" 
      onBack={onBack}
      footer={
        <button 
          onClick={onNext}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 group shadow-xl active:scale-[0.98]"
        >
          다음
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      }
    >
      <div className="px-6 pt-10">
        <h2 className="text-[20px] font-extrabold leading-[1.3] mb-8 text-theme-main">
          직원 역량 향상을 위한<br/>360º 피드백
        </h2>
        <div className="space-y-6 text-theme-sub text-base leading-relaxed">
          <p>
            본 피드백은 '단점 중심 피드백'이 아닌<br/>'강점을 발견하고 서로의 성장을 목표'로 합니다.
          </p>
          <p>
            참여 대상자는 <span className="text-theme-main font-bold bg-theme-highlight px-1.5 py-0.5 rounded border border-theme animate-highlight hover:shadow-sm transition-all duration-300">본사 재직 1년 이상인 직원</span> 이며, 작성 대상은 본인과 프로젝트나 제안 업무를 함께 수행한 직원입니다.
          </p>
          <p>
            작성하신 의견은 모두 <span className="text-theme-main font-bold bg-theme-highlight px-1.5 py-0.5 rounded border border-theme animate-highlight [animation-delay:200ms] hover:shadow-sm transition-all duration-300">익명으로 수집</span> 됩니다.
          </p>
          <p>
            작성하신 의견은 조직 성장에<br/>소중한 방향으로 활용하겠습니다.<br/>여러분의 참여가 조직의 더 나은 내일을 만듭니다.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default P2_1_Intro;
