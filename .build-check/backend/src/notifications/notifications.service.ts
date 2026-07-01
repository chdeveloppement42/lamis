import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE NOTIFICATION ───────────────────────────────────────
  async create(data: {
    type: NotificationType;
    message: string;
    adminId: number;
  }) {
    return this.prisma.notification.create({ data });
  }

  // ─── BROADCAST TO ALL ADMINS ───────────────────────────────────
  async broadcast(data: { type: NotificationType; message: string }) {
    const admins = await this.prisma.admin.findMany({ select: { id: true } });
    return this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        type: data.type,
        message: data.message,
        adminId: admin.id,
      })),
    });
  }

  // ─── LIST FOR ADMIN ────────────────────────────────────────────
  async findAllForAdmin(adminId: number) {
    return this.prisma.notification.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── COUNT UNREAD ──────────────────────────────────────────────
  async countUnread(adminId: number) {
    return this.prisma.notification.count({
      where: { adminId, isRead: false },
    });
  }

  // ─── MARK AS READ ─────────────────────────────────────────────
  async markAsRead(id: number, adminId: number) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, adminId },
    });
    if (!notif) throw new NotFoundException('Notification introuvable');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // ─── MARK ALL AS READ ─────────────────────────────────────────
  async markAllAsRead(adminId: number) {
    await this.prisma.notification.updateMany({
      where: { adminId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'Toutes les notifications marquées comme lues' };
  }
}
