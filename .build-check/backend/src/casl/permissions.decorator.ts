import { SetMetadata } from '@nestjs/common';

export type PermissionRule = { action: string; subject: string };
export const PERMISSIONS_KEY = 'permissions_required';

// Usage: @CheckPermissions({ action: 'manage', subject: 'providers' })
export const CheckPermissions = (...requirements: PermissionRule[]) =>
  SetMetadata(PERMISSIONS_KEY, requirements);
