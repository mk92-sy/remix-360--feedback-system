
import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';

interface P4_1AdminPasswordChangeProps {
  currentAdminPassword: string;
  onPasswordChanged: (newPassword: string) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'warning') => void;
}

const P4_1_AdminPasswordChange: React.FC<P4_1AdminPasswordChangeProps> = ({ 
  currentAdminPassword, 
  onPasswordChanged, 
  onBack,
  showToast
}) => {
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  
  const [errors, setErrors] = useState<{
    current?: boolean;
    new?: boolean;
    confirm?: boolean;
  }>({});

  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleUpdateClick = () => {
    const newErrors: { current?: boolean; new?: boolean; confirm?: boolean } = {};
    if (!currentPwInput) { newErrors.current = true; setErrors(newErrors); showToast('현재 비밀번호를 입력해주세요.', 'warning'); currentRef.current?.focus(); return; }
    if (!newPwInput) { newErrors.new = true; setErrors(newErrors); showToast('새 비밀번호를 입력해주세요.', 'warning'); newRef.current?.focus(); return; }
    if (!confirmPwInput) { newErrors.confirm = true; setErrors(newErrors); showToast('새 비밀번호 재확인을 입력해주세요.', 'warning'); confirmRef.current?.focus(); return; }
    if (currentPwInput !== currentAdminPassword) { newErrors.current = true; setErrors(newErrors); showToast('현재 비밀번호가 일치하지 않습니다.', 'warning'); currentRef.current?.focus(); return; }
    if (newPwInput !== confirmPwInput) { newErrors.confirm = true; setErrors(newErrors); showToast('새 비밀번호가 일치하지 않습니다.', 'warning'); confirmRef.current?.focus(); return; }
    setErrors({});
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
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">관리자 비밀번호 변경</h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">관리자 비밀번호를 변경해주세요.</p>
      </div>
      <div className="px-6 space-y-8">
        {[
          { label: '현재 비밀번호', value: currentPwInput, setter: setCurrentPwInput, ref: currentRef, err: errors.current },
          { label: '새 비밀번호', value: newPwInput, setter: setNewPwInput, ref: newRef, err: errors.new },
          { label: '새 비밀번호 재확인', value: confirmPwInput, setter: setConfirmPwInput, ref: confirmRef, err: errors.confirm },
        ].map((item) => (
          <div key={item.label} className="space-y-3">
            <label className="text-[15px] font-bold text-theme-main ml-1">{item.label}</label>
            <div className="relative">
              <input 
                ref={item.ref}
                type="password"
                value={item.value}
                onChange={(e) => { item.setter(e.target.value); setErrors(prev => ({ ...prev, [item.label === '현재 비밀번호' ? 'current' : item.label === '새 비밀번호' ? 'new' : 'confirm']: false })); }}
                placeholder={`${item.label}를 입력하세요`}
                className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/30 focus:outline-none transition-all shadow-sm ${item.err ? 'border-red-500 ring-1 ring-red-500/50' : 'border-theme focus:ring-1 focus:ring-accent/20'}`}
              />
            </div>
          </div>
        ))}
      </div>
      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">변경완료</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">비밀번호 변경이 완료되었습니다.</p>
            <button onClick={handleConfirmComplete} className="w-full py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]">확인</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P4_1_AdminPasswordChange;
