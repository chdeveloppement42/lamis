/**
 * Notification shared types
 * Mirrors the Prisma Notification model as returned by the API.
 */

export type NotificationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export type NotificationEvent =
  | 'PROVIDER_VALIDATED'
  | 'PROVIDER_SUSPENDED'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'BALANCE_UPDATED'
  | 'DOCUMENT_REVIEWED'
  | 'SYSTEM';

/** Full notification payload from GET /notifications */
export interface NotificationPayload {
  id: string;
  message: string;
  severity: NotificationSeverity;
  event: NotificationEvent;
  read: boolean;
  createdAt: string;
  /** The user this notification belongs to */
  userId: string;
}

/** Patch body for marking notification(s) as read */
export interface MarkReadDto {
  ids: string[];
}
