
import React, { useState } from 'react';
import Layout from '../components/Layout';

interface P0_1AdminPasswordChangeProps {
  currentAdminPassword: string;
  onPasswordChanged: (newPassword: string) => void;
  onBack: () => void;
}

const P0_1_AdminPasswordChange: React.FC<P0_1AdminPasswordChangeProps> = ({ 
  currentAdminPassword, 
  onPasswordChanged, 
  onBack 
}) => {
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleUpdateClick = () => {
    if (!currentPwInput || !newPwInput || !confirmPwInput) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (currentPwInput !== currentAdminPassword) {
      alert('현재 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPwInput !== confirmPwInput) {
      alert('새 비밀번호와 재확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setShowCompleteModal(true);
  };

  const handleConfirmComplete = () => {
    onPasswordChanged(newPwInput);
    setShowCompleteModal(false);
  };

  return (
    <Layout 
      title="" 
      onBack={onBack}
      footer={
        <button 
          onClick={handleUpdateClick}
          className="w-full h-[56px] bg-accent text-white font-bold rounded-2xl text-[16px] shadow-xl active:scale-[0.98] transition-all"
        >
          변경하기
        </button>
      }
    >
      <div className="px-6 pt-10 pb-8">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">
          관리자 비밀번호 변경
        </h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">
          관리자 비밀번호를 변경해주세요.
        </p>
      </div>

      <div className="px-6 space-y-8">
        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">현재 비밀번호</label>
          <div className="relative">
            <input 
              type="password"
              value={currentPwInput}
              onChange={(e) => setCurrentPwInput(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              className="w-full h-[52px] bg-surface-dark border border-theme rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">새 비밀번호</label>
          <div className="relative">
            <input 
              type="password"
              value={newPwInput}
              onChange={(e) => setNewPwInput(e.target.value)}
              placeholder="새 비밀번호를 입력하세요"
              className="w-full h-[52px] bg-surface-dark border border-theme rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">새 비밀번호 재확인</label>
          <div className="relative">
            <input 
              type="password"
              value={confirmPwInput}
              onChange={(e) => setConfirmPwInput(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              className="w-full h-[52px] bg-surface-dark border border-theme rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/40 focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div 
            className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          />
          
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">변경완료</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              비밀번호 변경이 완료되었습니다.
            </p>
            
            <button
              onClick={handleConfirmComplete}
              className="w-full py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P0_1_AdminPasswordChange;
