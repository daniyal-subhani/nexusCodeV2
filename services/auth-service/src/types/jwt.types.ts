import { UserRole } from './user.types';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  iat: number;
  exp: number;
}
