import { AccessTokenInput, AccessTokenPayload } from '@/types/jwt.types';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import crypto, { randomUUID } from 'crypto';

const REFRESH_TOKEN_BYTES = 32;

// for client (cookie)
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
};

// store in db
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const ACCESS_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET as string;
if (!ACCESS_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not set');
}
const ACCESS_OPTIONS: SignOptions = {
  expiresIn: process.env.ACCESS_EXPIRE as SignOptions['expiresIn'],
  issuer: 'nexusCoreV2',
  audience: 'nexusCoreV2-api',
};

export const generateAccessToken = (payload: AccessTokenInput): string => {
  return jwt.sign({ ...payload, jti: randomUUID() }, ACCESS_SECRET, ACCESS_OPTIONS);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer: 'nexusCoreV2',
    audience: 'auth-service',
  }) as AccessTokenPayload;
};
