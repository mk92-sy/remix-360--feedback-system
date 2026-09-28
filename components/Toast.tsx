
import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning';
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  const isWarning = type === 'warning';
  
  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isWarning ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/20' : 'bg-surface-dark border border-theme'} backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 animate-in fade-in zoom-in duration-300 pointer-events-none transition-colors duration-500`}>
      <span className={`material-symbols-outlined text-[20px] ${isWarning ? 'text-red-600' : 'text-green-600'}`}>
        {isWarning ? 'error' : 'check_circle'}
      </span>
      <span className={`font-bold text-sm ${isWarning ? 'text-red-900 dark:text-red-200' : 'text-theme-main'}`}>{message}</span>
    </div>
  );
};

export default Toast;
