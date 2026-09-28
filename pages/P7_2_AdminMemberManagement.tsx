
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Member, FeedbackSession } from '../types';

interface P7_2AdminMemberManagementProps {
  members: Member[];
  allSessions: FeedbackSession[];
  sessionYear: string;
  sessionType: string;
  onDeleteMember: (id: string) => void;
  onAddMember: () => void;
  onMembersLoaded: (members: Member[]) => void;
  onRegisterComplete: () => void;
  onBack: () => void;
}

const P7_2_AdminMemberManagement: React.FC<P7_2AdminMemberManagementProps> = ({ 
  members, 
  allSessions,
  sessionYear, 
  sessionType, 
  onDeleteMember, 
  onAddMember, 
  onMembersLoaded,
  onRegisterComplete, 
  onBack 
}) => {
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const hasPreviousSessions = allSessions.some(s => s.type === '360도 다면 피드백' && s.year < sessionYear);
  const [isImportStepFinished, setIsImportStepFinished] = useState(!hasPreviousSessions || members.length > 0);
  
  const teams: string[] = Array.from(new Set(members.map(m => m.team)));

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setIsImportStepFinished(true);
  };

  const handleConfirmImport = () => {
    const prev360Sessions = allSessions
      .filter(s => s.type === '360도 다면 피드백' && s.year < sessionYear)
      .sort((a, b) => b.year.localeCompare(a.year));
    
    if (prev360Sessions.length > 0) {
      const prevMembers = prev360Sessions[0].members.map(m => ({ ...m, isAvailable: true }));
      onMembersLoaded(prevMembers);
    }
    
    setShowImportModal(false);
    setIsImportStepFinished(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const handleRegisterClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRegister = () => {
    setShowConfirmModal(false);
    setShowCompleteModal(true);
  };

  return (
    <Layout 
      title="직원 명단 관리" 
      onBack={onBack}
      footer={
        <div className="flex gap-3 w-full">
          {!isImportStepFinished ? (
            <button 
              onClick={handleImportClick}
              className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all"
            >
              직원 불러오기
            </button>
          ) : (
            <button 
              onClick={onAddMember}
              className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all"
            >
              직원 추가하기
            </button>
          )}
          <button 
            onClick={handleRegisterClick}
            className="flex-1 py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all shadow-xl"
          >
            등록하기
          </button>
        </div>
      }
    >
      <div className="px-6 pt-10 pb-10">
        <h2 className="text-[28px] font-bold leading-tight mb-4 text-theme-main">
          직원 명단 관리
        </h2>
        <div className="space-y-1">
          <p className="text-theme-sub text-[15px] font-medium opacity-70 leading-relaxed">
            {!isImportStepFinished 
              ? "직원 불러오기를 통해 이전 명단을 가져올 수 있습니다."
              : "직원을 추가하려면 하단 버튼에서 직원추가를 눌러주세요."}
          </p>
          <p className="text-theme-sub text-[15px] font-medium opacity-70 leading-relaxed">
            직원을 삭제하려면 이름 옆에 x버튼을 눌러주세요.
          </p>
        </div>
      </div>

      <div className="px-5 space-y-10 pb-20">
        {teams.length > 0 ? teams.map(team => (
          <div key={team}>
            <div className="flex items-center justify-between py-2 mb-5 border-b border-theme">
              <h3 className="text-[19px] font-bold text-theme-main">{team}</h3>
              <span className="material-symbols-outlined text-theme-sub rotate-180">
                expand_more
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              {members.filter(m => m.team === team).map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-surface-dark border border-theme shadow-sm"
                >
                  <span className="text-[15px] font-bold text-theme-main truncate">{member.name}</span>
                  <button 
                    onClick={() => setMemberToDelete(member)}
                    className="flex items-center justify-center ml-2 text-theme-sub opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-theme-sub opacity-40">
            직원 명단이 비어있습니다.
          </div>
        )}
      </div>

      {/* Modals with theme colors */}
      {showImportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={handleCancelImport} />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[20px] font-bold text-theme-main mb-3">직원 불러오기</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              이전 피드백 명단을<br/>불러오시겠습니까?
            </p>
            <div className="flex gap-3">
              <button onClick={handleCancelImport} className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소</button>
              <button onClick={handleConfirmImport} className="flex-1 py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]">불러오기</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">피드백 등록하기</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              {sessionYear}년 {sessionType}을<br/>등록하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소하기</button>
              <button onClick={handleConfirmRegister} className="flex-1 py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]">등록하기</button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">등록 완료</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">
              {sessionYear}년 {sessionType}이<br/>등록되었습니다.
            </p>
            <button onClick={onRegisterComplete} className="w-full py-4 bg-accent text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]">확인</button>
          </div>
        </div>
      )}

      {memberToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={() => setMemberToDelete(null)} />
          <div className="relative w-full max-w-[320px] bg-surface-dark border border-theme rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-[22px] font-bold text-theme-main mb-3">등록 삭제</h3>
            <p className="text-[15px] text-theme-sub font-medium mb-8 leading-relaxed">직원 정보를 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setMemberToDelete(null)} className="flex-1 py-4 bg-background-dark border border-theme text-theme-main font-bold rounded-2xl active:scale-95 transition-all text-[15px]">취소하기</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px]">삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default P7_2_AdminMemberManagement;
