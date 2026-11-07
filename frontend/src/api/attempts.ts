import { http } from "./http";
import type { Attempt } from "../types/attempt";

export type AttemptMode = "exam" | "practice";

export type AttemptSettingsInput = {
  paging?: string;
  questionsPerPage?: number;
  questionTimeSeconds?: number;
  showAnswerAfterSelect?: boolean;
  shuffleQuestions?: boolean;
};

export type StartAttemptPayload = {
  subjectId: string;
  chapterId: string;
  mode: AttemptMode;
  settings?: AttemptSettingsInput;
  durationMinutes?: number;
};

export type StartAttemptResponse = {
  attempt: Attempt;
  totalQuestions: number;
  durationMinutes: number;
  expiresAt: string;
};

export type SaveAnswerPayload = {
  questionId: string;
  optionId?: string;
  selectedOptionIds?: string[];
  value?: string;
  flagged?: boolean;
};

export type SaveAnswerResponse = {
  answer: {
    id: string;
    attemptId: string;
    questionId: string;
    selectedOptionIds: string[] | null;
    value: string | null;
    flagged?: boolean;
    isCorrect?: boolean | null;
    earnedPoints?: number;
  };
  correctAnswers?: Array<{ id: string; text: string }>;
};

export type SubmitAttemptResponse = {
  attempt: Attempt;
  totalEarnedPoints: number;
  maxScore: number;
  correctCount: number;
  totalCount: number;
};

export type AttemptGradeResponse = {
  attempt: {
    id: string;
    userId: string;
    subjectId: string | null;
    chapterId: string | null;
    mode: AttemptMode;
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    timeSpentSeconds: number;
    durationMinutes: number;
    score: number;
    maxScore: number;
  };
  summary: {
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    totalQuestions: number;
    totalEarnedPoints: number;
    maxScore: number;
    accuracyPercentage: number;
    isPassed: boolean;
    rank: number | null;
  };
  detailedAnswers: Array<{
    questionId: string;
    questionType: string;
    questionText: string;
    points: number;
    maxPoints: number;
    status: "correct" | "wrong" | "blank";
    selectedAnswer: Array<{ id: string; text: string }> | string | null;
    correctAnswer: Array<{ id: string; text: string }> | string | null;
  }>;
};

export type AttemptHistoryResponse = {
  data: Attempt[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
};

export async function getAttempt(attemptId: string): Promise<Attempt> {
  const res = await http.get(`/attempts/${attemptId}`);
  return res.data;
}

export async function startAttempt(payload: StartAttemptPayload): Promise<StartAttemptResponse> {
  const res = await http.post<StartAttemptResponse>("/attempts/start", payload);
  return res.data;
}

export async function saveAttemptAnswer(
  attemptId: string,
  payload: SaveAnswerPayload
): Promise<SaveAnswerResponse> {
  const res = await http.post<SaveAnswerResponse>(`/attempts/${attemptId}/answers`, payload);
  return res.data;
}

export async function submitAttempt(attemptId: string): Promise<SubmitAttemptResponse> {
  const res = await http.post<SubmitAttemptResponse>(`/attempts/${attemptId}/submit`);
  return res.data;
}

export async function getAttemptGrade(attemptId: string): Promise<AttemptGradeResponse> {
  const res = await http.get<AttemptGradeResponse>(`/attempts/${attemptId}/grade`);
  return res.data;
}

export async function getMyAttempts(params?: Record<string, string | number | boolean>): Promise<AttemptHistoryResponse> {
  const res = await http.get<AttemptHistoryResponse>("/attempts/mine", { params });
  return res.data;
}

export async function getAllAttempts(params?: Record<string, string | number | boolean>): Promise<AttemptHistoryResponse> {
  const res = await http.get<AttemptHistoryResponse>("/attempts", { params });
  return res.data;
}

export async function hardDeleteAttempt(attemptId: string): Promise<void> {
  await http.delete(`/attempts/${attemptId}/hard`);
}
