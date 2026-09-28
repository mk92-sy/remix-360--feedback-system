
export type PageId = 
  | 'P0' 
  | 'P0-1'
  | 'P4'
  | 'P4-1'
  | 'P1' 
  | 'P2-1' 
  | 'P2-2' 
  | 'P2-3' 
  | 'P3-1' 
  | 'P3-2' 
  | 'P5' 
  | 'P5-1' 
  | 'P5-2' 
  | 'P6'
  | 'P7'
  | 'P7-1'
  | 'P7-2'
  | 'P7-3'
  | 'P7-4'
  | 'P7-5';

export interface Member {
  id: string;
  name: string;
  team: string;
  isAvailable: boolean;
  loginCode?: string;
  isFirstLogin?: boolean;
}

export interface FeedbackData {
  memberId: string;
  good: string;
  suggestions: string;
  rehire?: boolean;
}

export interface FeedbackSession {
  id: string;
  year: string;
  type: '360도 다면 피드백' | '인사이트 피드백';
  period: string;
  code: string;
  members: Member[];
  feedbacks?: Record<string, { good: string, suggestions: string, rehire?: boolean, authorHash?: string }[]>; // memberId -> feedback list
  insights?: { content: string, authorHash: string }[]; // insight content list with authorHash
}
