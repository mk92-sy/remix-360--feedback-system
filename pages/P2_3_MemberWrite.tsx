
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Member } from '../types';

interface P2_3MemberWriteProps {
  member: Member | null;
  initialData?: { good: string; suggestions: string; rehire?: boolean };
  onComplete: (good: string, suggestions: string, rehire: boolean) => void;
  onBack: () => void;
}

const P2_3_MemberWrite: React.FC<P2_3MemberWriteProps> = ({ member, initialData, onComplete, onBack }) => {
  const [goodPoints, setGoodPoints] = useState(initialData?.good || '');
  const [suggestions, setSuggestions] = useState(initialData?.suggestions || '');
  const [showModal, setShowModal] = useState(false);

  const handleCompleteClick = () => {
    setShowModal(true);
  };

  const handleChoice = (choice: boolean) => {
    onComplete(goodPoints, suggestions, choice);
    setShowModal(false);
  };

  return (
    <Layout 
      title="360º 다면 피드백" 
      onBack={onBack}
      footer={
        <button 
          onClick={handleCompleteClick}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg shadow-xl active:scale-[0.98]"
        >
          {initialData ? '수정 완료' : '완료'}
        </button>
      }
    >
      <div className="flex flex-col items-center px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-theme-highlight border border-theme mb-5">
          <span className="text-sm font-bold text-theme-main">{member?.name || '직원'}</span>
        </div>
        <h2 className="text-[28px] font-bold leading-tight mb-3 text-theme-main">
          직원 역량 향상을 위한<br/>360º 피드백
        </h2>
        <p className="text-sm text-theme-sub">동료의 성장을 위해 솔직하고 구체적인<br/>피드백을 남겨주세요.</p>
      </div>

      <div className="px-5 space-y-8 pb-20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-blue-500">thumb_up</span>
            </div>
            <p className="font-bold text-theme-main">좋은점</p>
          </div>
          <textarea 
            value={goodPoints}
            onChange={(e) => setGoodPoints(e.target.value)}
            className="w-full min-h-[160px] rounded-2xl bg-surface-dark border border-theme p-5 text-sm leading-relaxed text-theme-main focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-theme-sub/50 shadow-sm"
            placeholder="동료의 강점과 긍정적인 영향을 서술해주세요. 구체적인 사례를 들어주시면 더욱 좋습니다."
          ></textarea>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-orange-500">lightbulb</span>
            </div>
            <p className="font-bold text-theme-main">바라는점</p>
          </div>
          <textarea 
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            className="w-full min-h-[160px] rounded-2xl bg-surface-dark border border-theme p-5 text-sm leading-relaxed text-theme-main focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-theme-sub/50 shadow-sm"
            placeholder="동료가 개선했으면 하는 점이나 아쉬웠던 점을 서술해주세요. 건설적인 피드백 부탁드립니다."
          ></textarea>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-[340px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-accent text-[32px]">group_add</span>
            </div>
            <h3 className="text-[20px] font-bold text-theme-main mb-3 leading-tight">
              이 사람과 또 같은 프로젝트에<br/>투입되고 싶습니까?
            </h3>
            <p className="text-[14px] text-theme-sub font-medium mb-8 opacity-70">
              선택하신 답변은 익명으로 처리됩니다.
            </p>
            <div className="flex gap-6 justify-center">
              <button 
                onClick={() => handleChoice(false)} 
                className="w-[110px] h-[110px] flex items-center justify-center bg-surface-dark border border-theme text-theme-sub rounded-[32px] active:scale-95 transition-all hover:bg-red-500/10 hover:border-red-500/20 group"
              >
                <span className="material-symbols-outlined text-[48px] group-hover:text-red-500 transition-colors">sentiment_dissatisfied</span>
              </button>
              <button 
                onClick={() => handleChoice(true)} 
                className="w-[110px] h-[110px] flex items-center justify-center bg-accent text-white rounded-[32px] active:scale-95 transition-all shadow-xl shadow-accent/20"
              >
                <span className="material-symbols-outlined text-[48px]">sentiment_satisfied</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P2_3_MemberWrite;
