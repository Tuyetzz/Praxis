export interface FlashcardDeck {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashcardDeckPayload {
  title: string;
  isPublic: boolean;
}

export interface UpdateFlashcardDeckPayload {
  title?: string;
  isPublic?: boolean;
}
