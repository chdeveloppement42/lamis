/**
 * Authentication & Authorization shared types
 * Source of truth for JWT payload structure and auth API contracts.
 */

/** JWT token payload — matches what auth.service.ts signs */
export interface JwtPayload {
  /** User UUID (Prisma User.id) */
  sub: string;
  email: string;
  /** Role name, e.g. 'ADMIN' | 'MANAGER' | 'MODERATOR' | 'PROVIDER' | 'CLIENT' */
  role: string;
  /** Flat permission strings, e.g. ['create:listing', 'read:users'] */
  permissions: string[];
  iat?: number;
  exp?: number;
}

/** POST /auth/login request body */
export interface LoginDto {
  email: string;
  password: string;
}

/** POST /auth/login response */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

/** POST /auth/register (client/provider) request body */
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  wilaya: string;
  commune: string;
  quartier?: string;
}
