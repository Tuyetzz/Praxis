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

export type ImportFlashcardsResult = {
  totalCards: number;
  imported: number;
  failed: number;
  errors?: Array<{ line: number; error: string }>;
};

export async function importFlashcards(params: {
  file: File;
  deckId: string;
}): Promise<ImportFlashcardsResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("deckId", params.deckId);

  const res = await http.post<ImportFlashcardsResult>("/flashcards/import", formData);
  return res.data;
}

/**
 * Download a deck as a file.
 *
 * Uses a blob rather than a plain link because the endpoint needs the
 * Authorization header, which a bare <a href> cannot send.
 */
export async function exportFlashcards(deckId: string, format: "txt" | "csv" = "txt"): Promise<void> {
  const res = await http.get(`/flashcards/export/${deckId}`, {
    params: { format },
    responseType: "blob",
  });

  const disposition: string = res.headers?.["content-disposition"] ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const fileName = match?.[1] ?? `flashcards.${format}`;

  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
