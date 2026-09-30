
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Member } from '../types';

interface P2_3MemberWriteProps {
  member: Member | null;
  initialData?: { 
    good: string; 
    suggestions: string; 
    rehire?: boolean;
    workRehire?: '좋아요' | '그저그래요' | '싫어요';
    personalRehire?: '좋아요' | '그저그래요' | '싫어요';
  };
  onComplete: (good: string, suggestions: string, rehire: boolean, workRehire: '좋아요' | '그저그래요' | '싫어요', personalRehire: '좋아요' | '그저그래요' | '싫어요') => void;
  onBack: () => void;
}

const P2_3_MemberWrite: React.FC<P2_3MemberWriteProps> = ({ member, initialData, onComplete, onBack }) => {
  const [goodPoints, setGoodPoints] = useState(initialData?.good || '');
  const [suggestions, setSuggestions] = useState(initialData?.suggestions || '');
  const [showModal, setShowModal] = useState(false);
  const [workChoice, setWorkChoice] = useState<'좋아요' | '그저그래요' | '싫어요' | null>(null);
  const [personalChoice, setPersonalChoice] = useState<'좋아요' | '그저그래요' | '싫어요' | null>(null);

  const handleCompleteClick = () => {
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!workChoice || !personalChoice) return;
    const isRehirePositive = workChoice === '좋아요' && personalChoice === '좋아요';
    onComplete(goodPoints, suggestions, isRehirePositive, workChoice, personalChoice);
    setShowModal(false);
  };

  const choiceOptions: { label: '좋아요' | '그저그래요' | '싫어요'; icon: string }[] = [
    { label: '좋아요', icon: 'sentiment_satisfied' },
    { label: '그저그래요', icon: 'sentiment_neutral' },
    { label: '싫어요', icon: 'sentiment_dissatisfied' },
  ];

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-[360px] bg-surface-dark border border-theme rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-accent text-[26px]">handshake</span>
            </div>

            <h3 className="text-[18px] font-bold text-theme-main mb-1.5 text-center leading-tight">
              함께하는 동료로서의 협업 의견
            </h3>
            <p className="text-[13px] text-theme-sub font-medium mb-6 text-center opacity-70 leading-relaxed">
              서로의 발전과 건강한 팀워크 형성을 위해<br/>동료와의 협업 경험을 편안하게 나누어 주세요.
            </p>

            <div className="space-y-5 mb-6">
              {/* 항목 1: 업무적 협업 */}
              <div className="bg-background-dark/40 border border-theme/60 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[18px]">business_center</span>
                  <p className="text-[14px] font-bold text-theme-main">
                    업무적 협업
                  </p>
                </div>
                <p className="text-[12px] text-theme-sub opacity-70 leading-normal pl-0.5">
                  새로운 프로젝트나 과업을 진행할 때 업무적으로 협업하기 어떤가요?
                </p>
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {choiceOptions.map(opt => {
                    const isSelected = workChoice === opt.label;
                    return (
                      <button
                        key={`work-${opt.label}`}
                        type="button"
                        onClick={() => setWorkChoice(opt.label)}
                        className={`flex items-center justify-center h-[52px] rounded-2xl border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-accent text-white border-accent shadow-md shadow-accent/25'
                            : 'bg-surface-dark border-theme text-theme-sub hover:text-theme-main'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[28px]">{opt.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 항목 2: 태도 및 소통 협업 */}
              <div className="bg-background-dark/40 border border-theme/60 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[18px]">favorite</span>
                  <p className="text-[14px] font-bold text-theme-main">
                    태도 및 소통 협업
                  </p>
                </div>
                <p className="text-[12px] text-theme-sub opacity-70 leading-normal pl-0.5">
                  새로운 프로젝트나 과업을 진행할 때 태도 및 소통은 어떤가요?
                </p>
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {choiceOptions.map(opt => {
                    const isSelected = personalChoice === opt.label;
                    return (
                      <button
                        key={`personal-${opt.label}`}
                        type="button"
                        onClick={() => setPersonalChoice(opt.label)}
                        className={`flex items-center justify-center h-[52px] rounded-2xl border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-accent text-white border-accent shadow-md shadow-accent/25'
                            : 'bg-surface-dark border-theme text-theme-sub hover:text-theme-main'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[28px]">{opt.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-3.5 bg-background-dark border border-theme text-theme-sub font-bold rounded-xl active:scale-95 transition-all text-[14px]"
              >
                취소
              </button>
              <button 
                onClick={handleConfirm}
                disabled={!workChoice || !personalChoice}
                className={`flex-1 py-3.5 font-bold rounded-xl active:scale-95 transition-all text-[14px] ${
                  workChoice && personalChoice 
                    ? 'bg-accent text-white shadow-lg shadow-accent/25' 
                    : 'bg-surface-dark border border-theme text-theme-sub/40 cursor-not-allowed'
                }`}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P2_3_MemberWrite;
