import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── LIST ALL ADMINS ───────────────────────────────────────────
  async findAll() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isSuperAdmin: true,
        status: true,
        roleId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── GET SINGLE ADMIN ──────────────────────────────────────────
  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isSuperAdmin: true,
        status: true,
        roleId: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: { include: { permission: true } },
          },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!admin) throw new NotFoundException('Admin introuvable');
    return admin;
  }

  // ─── CREATE ADMIN ──────────────────────────────────────────────
  async create(
    creatorId: number,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      roleId: number;
    },
  ) {
    // Check email uniqueness
    const existing = await this.prisma.admin.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestException('Cet email est déjà utilisé');

    // Verify role exists and is not SuperAdmin role
    const role = await this.prisma.role.findUnique({
      where: { id: data.roleId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');
    if (role.isSuperAdmin)
      throw new ForbiddenException("Impossible d'assigner le rôle Super Admin");

    // ── Permission Escalation Check ────────────────────────────────
    // The creator cannot assign a role with permissions they don't have themselves
    const creator = await this.prisma.admin.findUnique({
      where: { id: creatorId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });

    if (creator && !creator.isSuperAdmin) {
      const creatorPermissions =
        creator.role?.permissions.map((rp: any) => rp.permission.action) || [];
      const targetPermissions = role.permissions.map(
        (rp: any) => rp.permission.action,
      );

      const escalated = targetPermissions.filter(
        (p: string) => !creatorPermissions.includes(p),
      );
      if (escalated.length > 0) {
        throw new ForbiddenException(
          `Escalation interdite : vous ne possédez pas les permissions [${escalated.join(', ')}]`,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.admin.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        roleId: data.roleId,
        createdById: creatorId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
  }

  // ─── UPDATE ADMIN ──────────────────────────────────────────────
  async update(
    id: number,
    data: { firstName?: string; lastName?: string; roleId?: number },
  ) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin introuvable');
    if (admin.isSuperAdmin)
      throw new ForbiddenException('Le Super Admin ne peut pas être modifié');

    if (data.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: data.roleId },
      });
      if (!role) throw new NotFoundException('Rôle introuvable');
      if (role.isSuperAdmin)
        throw new ForbiddenException(
          "Impossible d'assigner le rôle Super Admin",
        );
    }

    return this.prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        role: { select: { id: true, name: true } },
      },
    });
  }

  // ─── SUSPEND / REACTIVATE ─────────────────────────────────────
  async suspend(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin introuvable');
    if (admin.isSuperAdmin)
      throw new ForbiddenException('Le Super Admin ne peut pas être suspendu');

    return this.prisma.admin.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async reactivate(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin introuvable');

    return this.prisma.admin.update({
      where: { id },
      data: { status: 'VALIDATED' },
    });
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────
  async resetPassword(id: number, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin introuvable');
    if (admin.isSuperAdmin)
      throw new ForbiddenException(
        'Utilisez un autre mécanisme pour le Super Admin',
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async updateOwnProfile(
    adminId: number,
    data: { firstName?: string; lastName?: string; email?: string },
  ) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin introuvable');

    if (data.email && data.email !== admin.email) {
      const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
      if (existing) throw new BadRequestException('Cet email est déjà utilisé.');
    }

    return this.prisma.admin.update({
      where: { id: adminId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        role: { select: { id: true, name: true } },
      },
    });
  }

  // ─── CHANGE OWN PASSWORD (self) ────────────────────────────────
  async changeOwnPassword(
    adminId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin introuvable');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      throw new BadRequestException('Mot de passe actuel incorrect');

    // Validate new password
    if (newPassword.length < 4) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit contenir au moins 4 caractères',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  private async getMonthlyCounts(tableName: string, monthsBack = 12) {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ month: string; count: bigint }>>(
      `SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month,
              COUNT(*) AS count
       FROM "${tableName}"
       WHERE "createdAt" >= NOW() - INTERVAL '${monthsBack - 1} months'
       GROUP BY month
       ORDER BY month`
    );

    return rows.map((row) => ({ month: row.month, count: Number(row.count) }));
  }

  // ─── DASHBOARD STATS ──────────────────────────────────────────
  async getDashboardStats() {
    const [
      pendingProviders,
      totalProviders,
      publishedListings,
      draftListings,
      unpublishedListings,
      totalListings,
      activeCategories,
      unreadNotifications,
      monthlyProviders,
      monthlyListings,
    ] = await Promise.all([
      this.prisma.provider.count({ where: { status: 'PENDING' } }),
      this.prisma.provider.count(),
      this.prisma.listing.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.listing.count({ where: { status: 'DRAFT' } }),
      this.prisma.listing.count({ where: { status: 'UNPUBLISHED' } }),
      this.prisma.listing.count(),
      this.prisma.category.count(),
      this.prisma.notification.count({ where: { isRead: false } }),
      this.getMonthlyCounts('Provider'),
      this.getMonthlyCounts('Listing'),
    ]);

    return {
      pendingProviders,
      totalProviders,
      publishedListings,
      draftListings,
      unpublishedListings,
      totalListings,
      activeCategories,
      unreadNotifications,
      monthlyProviders,
      monthlyListings,
    };
  }

  // ─── DELETE ADMIN ──────────────────────────────────────────────
  async delete(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin introuvable');
    if (admin.isSuperAdmin)
      throw new ForbiddenException('Le Super Admin ne peut pas être supprimé');

    await this.prisma.admin.delete({ where: { id } });
    return { message: 'Compte administrateur supprimé avec succès' };
  }
}
