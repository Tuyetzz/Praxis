export type TypingTextDifficulty = "easy" | "medium" | "hard";

export interface TypingText {
  id: string;
  authorId: string;
  title: string;
  content: string;
  language: string;
  isPublic: boolean;
  isDefault: boolean;
  difficulty: TypingTextDifficulty;
  sourceType?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
