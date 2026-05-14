export interface Subject {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string; // BE trả về timestamp
  isDeleted?: boolean;
}
