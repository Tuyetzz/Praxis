import type { Option } from "./options";

export type QuestionType = "single" | "multiple" | "true_false" | "fill_blank";

export interface Question {
  id: string;
  text: string;
  type: "single" | "multiple" | "true_false" | "fill_blank";
  points?: number;
  createdAt?: string;
  options?: Option[];
  isDeleted?: boolean;
}