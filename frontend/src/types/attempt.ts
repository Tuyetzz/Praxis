export type AttemptStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "expired"
  | "graded";

export type AttemptMode = "exam" | "practice";

export interface AttemptSettings {
  paging?: string | { from: number; to: number };
  questionsPerPage?: number;
  questionTimeSeconds?: number;
  showAnswerAfterSelect?: boolean;
  shuffleQuestions?: boolean;
  totalQuestions?: number;
  subjectId?: string;
  chapterId?: string;
}

export interface Attempt {
  id: string;
  userId: string;
  subjectId: string | null;
  chapterId: string | null;
  mode: AttemptMode;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  durationMinutes: number;
  timeSpentSeconds: number;
  settings: AttemptSettings | null;
  score: number;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}
