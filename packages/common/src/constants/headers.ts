export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export const USER_ID_HEADER = 'x-user-id' as const;
export const USER_EMAIL_HEADER = 'x-user-email' as const;
export const USER_ROLE_HEADER = 'x-user-role' as const;
export const CORRELATION_ID_HEADER = 'x-correlation-id' as const;
