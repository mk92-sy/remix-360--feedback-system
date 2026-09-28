
import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { Member } from '../types';

interface P7_3AdminMemberRegisterProps {
  onRegister: (data: Omit<Member, 'id' | 'isAvailable'>) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'warning') => void;
}

const P7_3_AdminMemberRegister: React.FC<P7_3AdminMemberRegisterProps> = ({ onRegister, onBack, showToast }) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [errors, setErrors] = useState<{
    name?: boolean;
    team?: boolean;
  }>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const teamRef = useRef<HTMLSelectElement>(null);

  const teams = [
    '기획팀 (Planning Team)',
    '디자인팀 (Design Team)',
    '퍼블팀 (Publishing Team)'
  ];

  const handleRegisterClick = () => {
    const newErrors: typeof errors = {};

    if (!team) {
      newErrors.team = true;
      setErrors(newErrors);
      showToast('팀명을 선택해주세요.', 'warning');
      teamRef.current?.focus();
      return;
    }

    if (!name.trim()) {
      newErrors.name = true;
      setErrors(newErrors);
      showToast('이름을 입력해주세요.', 'warning');
      nameRef.current?.focus();
      return;
    }

    setErrors({});
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = () => {
    onRegister({ 
      name: name.trim(), 
      team
    });
    setShowCompleteModal(false);
  };

  return (
    <Layout 
      title="직원 추가하기" 
      onBack={onBack}
      footer={
        <button 
          onClick={handleRegisterClick}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg shadow-xl active:scale-[0.98] transition-all"
        >
          직원 추가하기
        </button>
      }
    >
      <div className="px-6 pt-10 pb-8">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">
          직원 추가하기
        </h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">
          새로운 직원의 정보를 입력해주세요.
        </p>
      </div>

      <div className="px-6 space-y-8 pb-10">
        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">팀명</label>
          <div className="relative">
            <select
              ref={teamRef}
              value={team}
              onChange={(e) => {
                setTeam(e.target.value);
                setErrors(prev => ({ ...prev, team: false }));
              }}
              className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main appearance-none focus:outline-none transition-all shadow-sm ${
                errors.team ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-white/10 focus:ring-1 focus:ring-accent/20'
              }`}
            >
              <option value="" disabled className="text-zinc-600">팀을 선택해주세요</option>
              {teams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-zinc-500">expand_more</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">이름</label>
          <div className="relative">
            <input 
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors(prev => ({ ...prev, name: false }));
              }}
              placeholder="이름을 입력하세요"
              className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main placeholder:text-zinc-600 focus:outline-none transition-all shadow-sm ${
                errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-white/10 focus:ring-1 focus:ring-accent/20'
              }`}
            />
          </div>
        </div>
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-white mb-3">추가 완료</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              직원 정보가 추가되었습니다.
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

export default P7_3_AdminMemberRegister;
