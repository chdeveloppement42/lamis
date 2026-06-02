import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { admins: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        admins: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');
    return role;
  }

  async create(data: { name: string; permissionIds: number[] }) {
    const existing = await this.prisma.role.findUnique({
      where: { name: data.name },
    });
    if (existing)
      throw new BadRequestException('Un rôle avec ce nom existe déjà');

    return this.prisma.role.create({
      data: {
        name: data.name,
        permissions: {
          create: data.permissionIds.map((pid) => ({
            permission: { connect: { id: pid } },
          })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async update(id: number, data: { name?: string; permissionIds?: number[] }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Rôle introuvable');
    if (role.isSuperAdmin)
      throw new BadRequestException(
        'Le rôle Super Admin ne peut pas être modifié',
      );

    if (data.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.permissionIds && {
          permissions: {
            create: data.permissionIds.map((pid) => ({
              permission: { connect: { id: pid } },
            })),
          },
        }),
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { admins: true } } },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');
    if (role.isSuperAdmin)
      throw new BadRequestException(
        'Le rôle Super Admin ne peut pas être supprimé',
      );
    const fallbackRole = await this.prisma.role.findFirst({
      where: { id: { not: id }, isSuperAdmin: false },
    });

    if (role._count.admins > 0 && !fallbackRole) {
      throw new BadRequestException(
        'Impossible de supprimer ce role : aucun role de remplacement disponible',
      );
    }

    if (fallbackRole) {
      await this.prisma.admin.updateMany({
        where: { roleId: id },
        data: { status: 'SUSPENDED', roleId: fallbackRole.id },
      });
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });

    await this.prisma.role.delete({ where: { id } });

    return {
      message: `Rôle "${role.name}" supprimé. ${role._count.admins} utilisateur(s) suspendu(s).`,
    };
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { id: 'asc' } });
  }
}
