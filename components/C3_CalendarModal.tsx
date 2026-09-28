
import React, { useState, useMemo } from 'react';

interface C3_CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const C3_CalendarModal: React.FC<C3_CalendarModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialStartDate,
  initialEndDate,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(today);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    // Admin should be able to select past dates
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const isToday = (date: Date) => date.getTime() === today.getTime();
  const isSelected = (date: Date) => (startDate && date.getTime() === startDate.getTime()) || (endDate && date.getTime() === endDate.getTime());
  const isInRange = (date: Date) => startDate && endDate && date > startDate && date < endDate;
  const isPast = (date: Date) => date < today;

  const formatDate = (date: Date | null) => {
    if (!date) return 'YYYY.MM.DD';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-[360px] bg-surface-dark border border-theme rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 transition-colors duration-500">
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <h3 className="text-[19px] font-bold text-theme-main">날짜 선택</h3>
          <button onClick={onClose} className="text-theme-sub hover:text-theme-main transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div className="h-px bg-theme-highlight mx-6 mb-6"></div>
        <div className="flex items-center justify-center gap-12 mb-8">
          <button onClick={prevMonth} className="text-theme-sub hover:text-theme-main transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
          <div className="text-[17px] font-bold text-theme-main">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</div>
          <button onClick={nextMonth} className="text-theme-sub hover:text-theme-main transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
        </div>
        <div className="px-6 mb-8">
          <div className="grid grid-cols-7 text-center mb-4">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => <span key={i} className="text-[13px] font-medium text-theme-sub opacity-40">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {daysInMonth.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const selected = isSelected(date);
              const range = isInRange(date);
              const isStart = startDate && date.getTime() === startDate.getTime();
              const isEnd = endDate && date.getTime() === endDate.getTime();
              const todayMark = isToday(date);
              return (
                <div key={i} className="relative flex items-center justify-center h-10 cursor-pointer group transition-all duration-200" onClick={() => handleDateClick(date)}>
                  {range && <div className="absolute inset-0 bg-accent/10" />}
                  {isStart && endDate && <div className="absolute inset-y-0 right-0 left-1/2 bg-accent/10" />}
                  {isEnd && startDate && <div className="absolute inset-y-0 left-0 right-1/2 bg-accent/10" />}
                  <div className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-full text-[14px] font-medium transition-all duration-300 ${selected ? 'bg-accent text-white shadow-lg scale-110' : 'text-theme-main hover:bg-theme-highlight'} ${todayMark && !selected ? 'ring-1 ring-accent/40' : ''}`}>
                    {date.getDate()}
                    {todayMark && !selected && <div className="absolute -bottom-1 w-1 h-1 bg-accent rounded-full"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-8 py-5 border-t border-theme flex items-center justify-between">
          <span className="text-[14px] text-theme-sub font-medium">선택된 기간</span>
          <span className="text-[14px] text-theme-main font-bold tracking-tight">{formatDate(startDate)} - {formatDate(endDate)}</span>
        </div>
        <div className="px-5 pb-6">
          <button disabled={!startDate || !endDate} onClick={() => { if (startDate && endDate) { onSelect(startDate, endDate); onClose(); } }} className="w-full h-[56px] bg-accent text-white font-bold rounded-2xl text-[16px] shadow-xl active:scale-[0.98] transition-all disabled:opacity-30">선택 완료</button>
        </div>
      </div>
    </div>
  );
};

export default C3_CalendarModal;
