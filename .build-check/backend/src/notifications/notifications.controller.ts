import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CheckPermissions } from '../casl/permissions.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ─── LIST MY NOTIFICATIONS ─────────────────────────────────────
  @Get()
  @CheckPermissions({ action: 'view', subject: 'notifications' })
  findAll(@Req() req: Request) {
    return this.notificationsService.findAllForAdmin((req.user as any).userId);
  }

  // ─── COUNT UNREAD ──────────────────────────────────────────────
  @Get('unread-count')
  @CheckPermissions({ action: 'view', subject: 'notifications' })
  countUnread(@Req() req: Request) {
    return this.notificationsService.countUnread((req.user as any).userId);
  }

  // ─── MARK ONE AS READ ─────────────────────────────────────────
  @Patch(':id/read')
  @CheckPermissions({ action: 'view', subject: 'notifications' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.notificationsService.markAsRead(id, (req.user as any).userId);
  }

  // ─── MARK ALL AS READ ─────────────────────────────────────────
  @Patch('read-all')
  @CheckPermissions({ action: 'view', subject: 'notifications' })
  markAllAsRead(@Req() req: Request) {
    return this.notificationsService.markAllAsRead((req.user as any).userId);
  }
}
