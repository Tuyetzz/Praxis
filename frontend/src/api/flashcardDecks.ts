import { http } from "./http";
import type {
  CreateFlashcardDeckPayload,
  FlashcardDeck,
  UpdateFlashcardDeckPayload,
} from "../types/flashcardDeck";

export async function getMyFlashcardDecks(): Promise<FlashcardDeck[]> {
  const res = await http.get<FlashcardDeck[]>("/flashcard-decks/mine");
  return res.data;
}

export async function getPublicFlashcardDecks(): Promise<FlashcardDeck[]> {
  const res = await http.get<FlashcardDeck[]>("/flashcard-decks/public");
  return res.data;
}

export async function getFlashcardDeckById(id: string): Promise<FlashcardDeck> {
  const res = await http.get<FlashcardDeck>(`/flashcard-decks/${id}`);
  return res.data;
}

export async function createFlashcardDeck(payload: CreateFlashcardDeckPayload): Promise<FlashcardDeck> {
  const res = await http.post<FlashcardDeck>("/flashcard-decks", payload);
  return res.data;
}

export async function updateFlashcardDeck(id: string, payload: UpdateFlashcardDeckPayload): Promise<FlashcardDeck> {
  const res = await http.put<FlashcardDeck>(`/flashcard-decks/${id}`, payload);
  return res.data;
}

export async function deleteFlashcardDeck(id: string): Promise<void> {
  await http.delete(`/flashcard-decks/${id}`);
}
