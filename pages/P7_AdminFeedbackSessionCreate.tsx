
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import C3_CalendarModal from '../components/C3_CalendarModal';

interface P7AdminFeedbackSessionCreateProps {
  sessions: any[];
  onNext: (year: string, type: string, period: string, initialCode: string) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'warning') => void;
}

const P7_AdminFeedbackSessionCreate: React.FC<P7AdminFeedbackSessionCreateProps> = ({ sessions, onNext, onBack, showToast }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [period, setPeriod] = useState('');
  const [initialCode, setInitialCode] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [errors, setErrors] = useState<{
    year?: boolean;
    type?: boolean;
    period?: boolean;
    initialCode?: boolean;
  }>({});

  const yearRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const periodRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const yearOptions = Array.from({ length: 8 }, (_, i) => (currentYear - 2 + i).toString());

  // Use a ref to track if we've already initialized for the current year/type
  const lastInitRef = useRef<string>('');

  useEffect(() => {
    const currentKey = `${selectedYear}-${selectedType}`;
    if (selectedYear && selectedType && currentKey !== lastInitRef.current) {
      lastInitRef.current = currentKey;
      const existingSession = sessions.find(s => s.year === selectedYear && s.type === selectedType);
      Promise.resolve().then(() => {
        if (existingSession) {
          setPeriod(existingSession.period);
          setInitialCode(existingSession.code || `DND${selectedYear}`);
        } else {
          // If no session of this type exists, check if any session of this year exists to suggest the same period
          const anySessionThisYear = sessions.find(s => s.year === selectedYear);
          if (anySessionThisYear) {
            setPeriod(anySessionThisYear.period);
          } else {
            setPeriod('');
          }
          setInitialCode(`DND${selectedYear}`);
        }
      });
    }
  }, [selectedYear, selectedType, sessions]);

  const handleNext = () => {
    const newErrors: typeof errors = {};
    
    if (!selectedYear) {
      newErrors.year = true;
      setErrors(newErrors);
      showToast('생성할 년도를 선택해주세요.', 'warning');
      yearRef.current?.focus();
      return;
    }

    if (!selectedType) {
      newErrors.type = true;
      setErrors(newErrors);
      showToast('피드백 목록을 선택해주세요.', 'warning');
      typeRef.current?.focus();
      return;
    }

    if (!period) {
      newErrors.period = true;
      setErrors(newErrors);
      showToast('오픈 기간을 설정해주세요.', 'warning');
      setIsCalendarOpen(true);
      return;
    }

    if (!initialCode.trim()) {
      newErrors.initialCode = true;
      setErrors(newErrors);
      showToast('초기 코드를 입력해주세요.', 'warning');
      codeRef.current?.focus();
      return;
    }

    setErrors({});
    onNext(selectedYear, selectedType, period, initialCode.trim());
  };

  const handleCalendarSelect = (start: Date, end: Date) => {
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}.${m}.${d}`;
    };
    setPeriod(`${formatDate(start)} - ${formatDate(end)}`);
    setErrors(prev => ({ ...prev, period: false }));
  };

  return (
    <Layout 
      title="신규 피드백 추가하기" 
      onBack={onBack}
      footer={
        <button 
          onClick={handleNext}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg shadow-xl active:scale-[0.98] transition-all"
        >
          다음
        </button>
      }
    >
      <div className="px-6 pt-10 pb-8">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">
          신규 피드백 추가하기
        </h2>
        <p className="text-theme-sub text-[15px] font-medium opacity-70">
          새로운 피드백을 추가해주세요.
        </p>
      </div>

      <div className="px-6 space-y-8">
        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">생성할 년도</label>
          <div className="relative">
            <select
              ref={yearRef}
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setErrors(prev => ({ ...prev, year: false }));
              }}
              className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main appearance-none focus:outline-none transition-all shadow-sm ${
                errors.year ? 'border-red-500 ring-1 ring-red-500/50' : 'border-theme focus:ring-1 focus:ring-accent/20'
              }`}
            >
              <option value="" disabled>년도를 선택해주세요</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-theme-sub">expand_more</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">피드백 목록</label>
          <div className="relative">
            <select
              ref={typeRef}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setErrors(prev => ({ ...prev, type: false }));
              }}
              className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main appearance-none focus:outline-none transition-all shadow-sm ${
                errors.type ? 'border-red-500 ring-1 ring-red-500/50' : 'border-theme focus:ring-1 focus:ring-accent/20'
              }`}
            >
              <option value="" disabled>피드백을 선택해주세요</option>
              <option value="360도 다면 피드백">360도 다면 피드백</option>
              <option value="인사이트 피드백">인사이트 피드백</option>
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-theme-sub">expand_more</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">오픈 기간 설정</label>
          <div className="relative">
            <input 
              ref={periodRef}
              type="text"
              readOnly
              value={period}
              placeholder="YYYY.MM.DD - YYYY.MM.DD"
              className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/40 focus:outline-none transition-all shadow-sm cursor-pointer ${
                errors.period ? 'border-red-500 ring-1 ring-red-500/50' : 'border-theme focus:ring-1 focus:ring-accent/20'
              }`}
              onClick={() => setIsCalendarOpen(true)}
            />
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-theme-sub text-[20px]">calendar_month</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[15px] font-bold text-theme-main ml-1">초기 코드 설정</label>
          <div className="relative">
            <input 
              ref={codeRef}
              type="text"
              value={initialCode}
              onChange={(e) => {
                setInitialCode(e.target.value);
                setErrors(prev => ({ ...prev, initialCode: false }));
              }}
              placeholder="초기 코드를 입력해주세요 (예: DND2025)"
              className={`w-full h-[52px] bg-surface-dark border rounded-2xl px-5 text-theme-main placeholder:text-theme-sub/40 focus:outline-none transition-all shadow-sm ${
                errors.initialCode ? 'border-red-500 ring-1 ring-red-500/50' : 'border-theme focus:ring-1 focus:ring-accent/20'
              }`}
            />
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-theme-sub text-[20px]">vpn_key</span>
            </div>
          </div>
          <p className="text-[12px] text-theme-sub opacity-60 ml-1">이 코드는 직원들의 초기 로그인 코드로 사용됩니다.</p>
        </div>
      </div>

      <C3_CalendarModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelect={handleCalendarSelect}
      />
    </Layout>
  );
};

export default P7_AdminFeedbackSessionCreate;
