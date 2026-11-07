export interface Flashcard {
  id: string;
  deckId: string;
  frontText: string;
  backText: string;
  order: number;
  nextReview?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashcardPayload {
  deckId: string;
  frontText: string;
  backText: string;
  order?: number;
  nextReview?: string | null;
}

export interface UpdateFlashcardPayload {
  frontText?: string;
  backText?: string;
  order?: number;
  nextReview?: string | null;
}
