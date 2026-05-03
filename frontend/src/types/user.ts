export type UserRole = "student" | "teacher" | "admin";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: UserRole;
  roles?: string[];
  status?: UserStatus;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
