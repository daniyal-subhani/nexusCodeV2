import { UserRole } from './user.types';
export type AccessTokenInput = {
  sub: string;
  email: string;
  role: UserRole;
};
export interface AccessTokenPayload {
  iat: number;
  exp: number;
  jti?: string;
}

// Refresh token: opaque random string, NOT a JWT.
// Only its SHA-256 hash is stored in refresh_tokens.tokenHash.
// This means a leaked DB dump can't be used to mint sessions.
