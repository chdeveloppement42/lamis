/**
 * Provider shared types
 * Mirrors the Prisma Provider model as returned by the API.
 */

export type ProviderStatus = 'PENDING' | 'VALIDATED' | 'SUSPENDED' | 'REJECTED';

/** API response shape for a provider profile */
export interface ProviderResponse {
  id: string;
  businessName: string;
  email: string;
  phone?: string;
  status: ProviderStatus;
  /** Account balance in platform currency units */
  balance: number;
  wilaya?: string;
  commune?: string;
  quartier?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Minimal provider reference embedded in other responses */
export interface ProviderRef {
  id: string;
  businessName: string;
  status: ProviderStatus;
}

/** Admin action to update a provider's status */
export interface UpdateProviderStatusDto {
  status: ProviderStatus;
  reason?: string;
}
