export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  createdAt: string;
  isDeleted?: boolean;
}
