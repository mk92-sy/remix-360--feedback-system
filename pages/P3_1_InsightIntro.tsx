
import React from 'react';
import Layout from '../components/Layout';

interface P3_1InsightIntroProps {
  onParticipate: () => void;
  onBack: () => void;
}

const P3_1_InsightIntro: React.FC<P3_1InsightIntroProps> = ({ onParticipate, onBack }) => {
  return (
    <Layout 
      title="인사이트 피드백" 
      onBack={onBack}
      footer={
        <button 
          onClick={onParticipate}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 group shadow-xl active:scale-[0.98]"
        >
          참여하기
        </button>
      }
    >
      <div className="px-6 pt-10">
        <h2 className="text-[20px] font-extrabold leading-[1.3] mb-8 text-theme-main">
          회사·팀 성장을 위한<br/>인사이트
        </h2>
        <div className="space-y-6 text-theme-sub text-base leading-relaxed">
          <p>
            회사가 더욱 긍정적으로 성장할 수 있도록 다양한 인사이트를 발굴하는 것을 목표로 합니다. 근무환경, 조직문화, 커뮤니케이션 방식, 지원 제도 등 개선이 필요하다고 느끼는 부분이나 바라는 점을 자유롭게 작성해 주시기 바랍니다. 또한, 회사와 관련하여 궁금한 점이나 제안하고 싶은 의견도 함께 남겨주셔도 됩니다.
          </p>
          <p>
            본 설문은 본사 직원이라면 <span className="text-theme-main font-bold bg-theme-highlight px-1.5 py-0.5 rounded border border-theme animate-highlight hover:shadow-sm transition-all duration-300">재직 기간과 관계없이 누구나 참여</span>할 수 있습니다.
          </p>
          <p>
            여러분의 시선과 의견 하나하나가 조직의 더 나은 방향을 만들어 갑니다.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default P3_1_InsightIntro;
