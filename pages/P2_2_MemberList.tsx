
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Member } from '../types';

interface P2_2MemberListProps {
  members: Member[];
  initialOpenTeam: string | null;
  onMemberSelect: (member: Member) => void;
  onBackToStart: () => void;
  onBack: () => void;
}

const P2_2_MemberList: React.FC<P2_2MemberListProps> = ({ members, initialOpenTeam, onMemberSelect, onBackToStart, onBack }) => {
  const teams: string[] = Array.from(new Set(members.map(m => m.team)));
  const [openTeam, setOpenTeam] = useState<string | null>(initialOpenTeam || teams[0] || null);

  const handleToggle = (e: React.MouseEvent, team: string) => {
    e.preventDefault();
    setOpenTeam(prev => (prev === team ? null : team));
  };

  return (
    <Layout 
      title="360º 다면 피드백" 
      onBack={onBack}
      footer={
        <button 
          onClick={onBackToStart}
          className="w-full bg-accent text-white font-bold py-4 rounded-2xl text-lg shadow-xl active:scale-[0.98]"
        >
          처음화면으로
        </button>
      }
    >
      <div className="px-6 pt-8 pb-6 text-theme-main">
        <h2 className="text-[20px] font-bold leading-tight mb-3">직원 역량 향상을 위한<br/>360º 피드백</h2>
        <p className="text-theme-sub text-[14px]">업무부서와 상관없이 자유로운 피드백이 가능합니다.</p>
      </div>

      <div className="px-5 pb-10">
        {teams.map(team => (
          <details 
            key={team} 
            className="group mb-8" 
            open={openTeam === team}
          >
            <summary 
              className="flex items-center justify-between cursor-pointer py-2 mb-4 border-b border-theme"
              onClick={(e) => handleToggle(e, team)}
            >
              <h3 className="text-lg font-bold text-theme-main">{team}</h3>
              <span className={`material-symbols-outlined text-theme-sub transition-transform duration-300 ${openTeam === team ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </summary>
            <div className="grid grid-cols-3 gap-2">
              {members.filter(m => m.team === team).map(member => (
                <button
                  key={member.id}
                  onClick={() => onMemberSelect(member)}
                  className={`
                    relative flex flex-col items-center justify-center py-4 px-2 rounded-xl text-sm font-bold transition-all
                    ${!member.isAvailable 
                      ? 'bg-accent/5 border border-accent/20 text-theme-sub opacity-60' 
                      : 'bg-surface-dark border border-theme text-theme-main hover:bg-theme-highlight active:scale-95 shadow-sm'}
                  `}
                >
                  <span className="truncate">{member.name}</span>
                  {!member.isAvailable && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm font-black">
                      완료
                    </span>
                  )}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </Layout>
  );
};

export default P2_2_MemberList;
