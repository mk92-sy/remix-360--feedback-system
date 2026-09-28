
import React, { useState } from 'react';
import Layout from '../components/Layout';

interface P3_2InsightWriteProps {
  initialData?: string;
  onComplete: (content: string) => void;
  onBack: () => void;
}

const P3_2_InsightWrite: React.FC<P3_2InsightWriteProps> = ({ initialData, onComplete, onBack }) => {
  const [content, setContent] = useState(initialData || '');

  // 데이터가 바뀌면 입력 필드 업데이트
  React.useEffect(() => {
    setContent(initialData || '');
  }, [initialData]);

  return (
    <Layout 
      title="인사이트 피드백" 
      onBack={onBack}
      footer={
        <button 
          onClick={() => content.trim() && onComplete(content)}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg shadow-xl active:scale-[0.98]"
        >
          완료
        </button>
      }
    >
      <div className="px-6 pt-10 pb-6 text-center">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">회사·팀 성장을 위한<br/>인사이트</h2>
        <p className="text-theme-sub text-sm">회사의 발전을 위해 솔직하고 구체적인<br/>피드백을 남겨주세요.</p>
      </div>

      <div className="px-5 h-[400px]">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full rounded-3xl bg-surface-dark border border-theme p-6 text-base leading-relaxed text-theme-main focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-theme-sub/50 shadow-sm"
          placeholder="구체적인 사례와 함께 작성하면 더욱 좋습니다. (예: 프로젝트 진행 중 소통 방식이 아쉬웠습니다...)"
        ></textarea>
      </div>
    </Layout>
  );
};

export default P3_2_InsightWrite;
