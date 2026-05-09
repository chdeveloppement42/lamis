import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  // ─── ADMIN: List all providers with optional status filter ──────
  async findAll(status?: AccountStatus) {
    return this.prisma.provider.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        wilaya: true,
        commune: true,
        quartier: true,
        documentUrl: true,
        status: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
    });
  }

  // ─── ADMIN: Get single provider details ─────────────────────────
  async findOne(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        listings: {
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!provider) throw new NotFoundException('Fournisseur introuvable.');
    // Never expose password
    const { password, ...result } = provider;
    return result;
  }

  // ─── ADMIN: Validate a provider ─────────────────────────────────
  async validate(id: number) {
    const provider = await this.findOne(id);
    if (provider.status !== 'PENDING') {
      throw new BadRequestException('Seuls les comptes en attente peuvent être validés.');
    }
    return this.prisma.provider.update({
      where: { id },
      data: { status: 'VALIDATED' },
    });
  }

  // ─── ADMIN: Reject a provider ───────────────────────────────────
  async reject(id: number) {
    const provider = await this.findOne(id);
    if (provider.status !== 'PENDING') {
      throw new BadRequestException('Seuls les comptes en attente peuvent être rejetés.');
    }
    return this.prisma.provider.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  // ─── ADMIN: Suspend a provider ──────────────────────────────────
  async suspend(id: number) {
    const provider = await this.findOne(id);
    if (provider.status === 'SUSPENDED') {
      throw new BadRequestException('Ce compte est déjà suspendu.');
    }
    return this.prisma.provider.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  // ─── ADMIN: Re-activate a suspended provider ───────────────────
  async reactivate(id: number) {
    const provider = await this.findOne(id);
    if (provider.status !== 'SUSPENDED') {
      throw new BadRequestException('Seuls les comptes suspendus peuvent être réactivés.');
    }
    return this.prisma.provider.update({
      where: { id },
      data: { status: 'VALIDATED' },
    });
  }

  // ─── PROVIDER: Get own profile (GAP 8) ─────────────────────────
  async getOwnProfile(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        wilaya: true,
        commune: true,
        quartier: true,
        documentUrl: true,
        status: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
    });
    if (!provider) throw new NotFoundException('Fournisseur introuvable.');
    return provider;
  }

  // ─── PROVIDER: Update own profile ──────────────────────────────
  async updateProfile(
    id: number,
    data: { firstName?: string; lastName?: string; phone?: string; wilaya?: string; commune?: string; quartier?: string },
  ) {
    await this.getOwnProfile(id);
    return this.prisma.provider.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        wilaya: true,
        commune: true,
        quartier: true,
        status: true,
      },
    });
  }

  // ─── PROVIDER: Update sensitive fields (triggers re-validation) ─
  async updateSensitiveFields(
    id: number,
    data: { email?: string; documentUrl?: string },
  ) {
    await this.getOwnProfile(id);
    return this.prisma.provider.update({
      where: { id },
      data: { ...data, status: 'PENDING' }, // RE-VALIDATION as per spec §6.9 & §12.6
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });
  }

  // ─── PROVIDER: Change own password (GAP 2) ─────────────────────
  async changeOwnPassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Fournisseur introuvable.');

    const isMatch = await bcrypt.compare(currentPassword, provider.password);
    if (!isMatch) throw new BadRequestException('Mot de passe actuel incorrect.');

    if (newPassword.length < 4) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 4 caractères.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.provider.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Mot de passe modifié avec succès.' };
  }
}
