export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'USER' | 'ADMIN';
