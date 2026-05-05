export interface TypingResult {
  id?: string;
  userId?: string;
  textId: string;
  wpm: number;
  accuracy: number;
  rawWpm?: number;
  durationSeconds?: number;
  errorTags?: Record<string, number>;
  createdAt?: string;
}
