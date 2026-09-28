
import React, { useState } from 'react';

interface P0LoginProps {
  onLogin: (name: string, code: string) => void;
  onAdminLogin: (password: string) => void;
  adminPassword: string;
  showToast: (message: string, type: 'success' | 'warning') => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const P0_Login: React.FC<P0LoginProps> = ({ onLogin, onAdminLogin, adminPassword, showToast, theme, onThemeChange }) => {
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userCode, setUserCode] = useState('');

  const handleAdminToggle = () => {
    setShowAdminPass(true);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === adminPassword) { 
      onAdminLogin(password);
    } else {
      showToast('비밀번호가 틀렸습니다.', 'warning');
    }
  };

  const handleUserLogin = () => {
    // 엄격한 입력 검증: 이름과 코드가 모두 있어야 함
    if (!userName.trim()) {
      showToast('이름을 입력해주세요.', 'warning');
      return;
    }
    if (!userCode.trim()) {
      showToast('코드를 입력해주세요.', 'warning');
      return;
    }
    onLogin(userName.trim(), userCode.trim());
  };

  const toggleTheme = () => {
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="relative flex flex-col h-full bg-background-dark items-center justify-center p-6 overflow-hidden transition-colors duration-500">
      <div className="flex flex-col items-center gap-8 mb-14">
        <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="w-full h-full bg-surface-dark border border-theme rounded-[32px] flex items-center justify-center shadow-lg transition-colors duration-500">
                <img src="image/dnd_logo.png" alt="D&D Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
            </div>
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-[40px] font-bold tracking-tight text-theme-main leading-tight">환영합니다</h1>
          <p className="text-theme-sub text-[17px] font-medium opacity-80">360° 다면 평가 시스템에 접속하세요</p>
        </div>
      </div>

      <div className="w-full space-y-10 max-w-sm">
        {!showAdminPass ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-theme-sub ml-1">이름</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-theme-sub text-[20px]">person</span>
                  </div>
                  <input 
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="block w-full rounded-2xl bg-surface-dark border border-theme py-4 pl-11 pr-4 text-theme-main focus:outline-none focus:ring-1 focus:ring-accent/10 transition-all text-sm placeholder:text-theme-sub/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-theme-sub ml-1">코드</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-theme-sub text-[20px]">vpn_key</span>
                  </div>
                  <input 
                    type="text"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="코드를 입력하세요"
                    className="block w-full rounded-2xl bg-surface-dark border border-theme py-4 pl-11 pr-4 text-theme-main focus:outline-none focus:ring-1 focus:ring-accent/10 transition-all text-sm placeholder:text-theme-sub/40"
                  />
                </div>
              </div>

              <p className="text-center text-theme-sub text-[13px] leading-relaxed font-medium mt-4 opacity-60">
                입력하신 이름은 보여지는 항목을 구분하기 위함입니다.<br/>저장되지 않습니다.
              </p>
            </div>

            <div className="flex flex-col gap-5 pt-4">
              <button 
                onClick={handleUserLogin}
                className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all text-[16px]"
              >
                로그인
              </button>
              <button 
                onClick={handleAdminToggle}
                className="w-full py-2 bg-transparent text-theme-sub font-medium hover:text-theme-main transition-all text-[14px] underline underline-offset-4"
              >
                관리자 로그인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label className="text-sm font-bold text-theme-sub ml-1">관리자 아이디</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-theme-sub text-[20px]">person</span>
                </div>
                <input 
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="아이디를 입력해주세요."
                  className="block w-full rounded-2xl bg-surface-dark border border-theme py-4 pl-11 pr-4 text-theme-main focus:outline-none focus:ring-1 focus:ring-accent/10 transition-all text-sm placeholder:text-theme-sub/40"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-theme-sub ml-1">비밀번호</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-theme-sub text-[20px]">lock</span>
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="****"
                  className="block w-full rounded-2xl bg-surface-dark border border-theme py-4 pl-11 pr-4 text-theme-main focus:outline-none focus:ring-1 focus:ring-accent/10 transition-all text-sm placeholder:text-theme-sub/40"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <button 
                type="submit"
                className="w-full py-4 bg-accent text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all text-[16px]"
              >
                관리자 로그인
              </button>
              
              <button 
                type="button"
                onClick={() => setShowAdminPass(false)}
                className="text-theme-sub text-[13px] font-medium hover:text-theme-main transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      <button 
        onClick={toggleTheme}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-surface-dark/40 backdrop-blur-md border border-theme flex items-center justify-center text-theme-main shadow-2xl active:scale-90 transition-all z-50 hover:bg-surface-dark/60"
      >
        <span className="material-symbols-outlined text-[24px]">
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </div>
  );
};

export default P0_Login;
