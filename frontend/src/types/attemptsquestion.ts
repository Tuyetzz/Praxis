// /types/attemptsquestion.ts
import type { Question } from "./question";

export interface AttemptQuestion {
  id: number;
  attemptId: number;
  questionId: number;
  optionOrder: number[] | null; // preserves option order after shuffling
  pageIndex: number;
  question?: Question; // present when Question is included in the query
}
