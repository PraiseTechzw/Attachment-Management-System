export interface Log {
  id: string;
  studentId: string;
  createdAt: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  supervisor: string;
  activities: string;
  skillsLearned: string;
  challenges: string;
  solutions: string;
  reflection: string;
  content: string; 
}

export interface Report {
  id: string;
  studentId: string;
  createdAt: string;
  filename: string;
  content: string;
  month: number;
  year: number;
}
