import { http } from "./http";
import type { CreateFlashcardPayload, Flashcard, UpdateFlashcardPayload } from "../types/flashcard";

export async function getFlashcardsByDeck(deckId: string): Promise<Flashcard[]> {
  const res = await http.get<Flashcard[]>(`/flashcards/deck/${deckId}`);
  return res.data;
}

export async function getFlashcardById(id: string): Promise<Flashcard> {
  const res = await http.get<Flashcard>(`/flashcards/${id}`);
  return res.data;
}

export async function createFlashcard(payload: CreateFlashcardPayload): Promise<Flashcard> {
  const res = await http.post<Flashcard>("/flashcards", payload);
  return res.data;
}

export async function updateFlashcard(id: string, payload: UpdateFlashcardPayload): Promise<Flashcard> {
  const res = await http.put<Flashcard>(`/flashcards/${id}`, payload);
  return res.data;
}

export async function deleteFlashcard(id: string): Promise<void> {
  await http.delete(`/flashcards/${id}`);
}
