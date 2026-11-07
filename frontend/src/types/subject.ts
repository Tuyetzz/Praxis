export interface Subject {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string; // backend returns a timestamp
  isDeleted?: boolean;
}
