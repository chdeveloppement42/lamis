import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListingStatus,
  NotificationType,
  AccountStatus,
  ListingType,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private storageService: StorageService,
  ) {}

  // ─── HELPER: Delete all images for a listing from storage & DB ──
  private async deleteListingImages(listingId: number): Promise<void> {
    const images = await this.prisma.listingImage.findMany({
      where: { listingId },
    });
    
    // Delete from Cloudinary/Storage
    for (const image of images) {
      try {
        await this.storageService.deleteFile(image.url);
      } catch (error) {
        // Log but don't throw — continue cleanup even if one fails
        console.error(`Failed to delete image ${image.url}:`, error);
      }
    }
    
    // Delete from database
    await this.prisma.listingImage.deleteMany({ where: { listingId } });
  }

  // ─── HELPER: Common Safety Lock Filter ──────────────────────────
  private get safetyLockWhere(): any {
    return {
      status: ListingStatus.PUBLISHED,
      provider: {
        status: AccountStatus.VALIDATED,
      },
    };
  }

  // ─── PUBLIC: Browse published listings with filters ─────────────
  async findPublished(filters: {
    categoryId?: number;
    wilaya?: string;
    commune?: string;
    type?: ListingType;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      categoryId,
      wilaya,
      commune,
      type,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = filters;

    const where: any = {
      AND: [this.safetyLockWhere],
    };

    if (categoryId)
      where.AND.push({ categoryId: parseInt(categoryId as any, 10) });
    if (type) where.AND.push({ type });
    if (wilaya)
      where.AND.push({ wilaya: { contains: wilaya, mode: 'insensitive' } });
    if (commune)
      where.AND.push({ commune: { contains: commune, mode: 'insensitive' } });
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice as any);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice as any);
      where.AND.push({ price: priceFilter });
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          provider: { select: { id: true, firstName: true, lastName: true } },
          images: { where: { isMain: true }, take: 1 },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── PUBLIC: Get a single published listing ─────────────────────
  async findOnePublished(id: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
        images: { orderBy: { isMain: 'desc' } },
      },
    });

    if (
      !listing ||
      listing.status !== 'PUBLISHED' ||
      listing.provider.status !== 'VALIDATED'
    ) {
      throw new NotFoundException('Annonce introuvable.');
    }
    return listing;
  }

  // ─── PUBLIC: Get latest 6 published listings (for landing page) ─
  async findLatest() {
    return this.prisma.listing.findMany({
      where: this.safetyLockWhere,
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { where: { isMain: true }, take: 1 },
      },
    });
  }

  // ─── PROVIDER: Create a listing ─────────────────────────────────
  async create(
    providerId: number,
    data: {
      title: string;
      description: string;
      price: number;
      type: ListingType;
      wilaya: string;
      commune: string;
      quartier?: string;
      surface?: number;
      rooms?: number;
      floor?: number;
      categoryId: number;
      status?: ListingStatus;
      images?: string[];
    },
  ) {
    // Verify provider is VALIDATED (unless saving as DRAFT)
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Fournisseur introuvable.');

    const isDraft = data.status === 'DRAFT' || !data.status;
    if (provider.status !== 'VALIDATED' && !isDraft) {
      throw new ForbiddenException(
        'Votre compte doit être validé pour publier une annonce.',
      );
    }

    const listing = await this.prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        wilaya: data.wilaya,
        commune: data.commune,
        quartier: data.quartier,
        surface: data.surface,
        rooms: data.rooms,
        floor: data.floor,
        status: data.status || 'DRAFT',
        provider: { connect: { id: providerId } },
        category: { connect: { id: data.categoryId } },
        images: {
          create:
            data.images?.map((url, index) => ({
              url,
              isMain: index === 0,
            })) || [],
        },
      },
      include: { category: true, images: true },
    });

    await this.notificationsService.broadcast({
      type: NotificationType.NEW_LISTING,
      message: `Nouvelle annonce : "${listing.title}" par ${provider.firstName} ${provider.lastName}`,
    });

    return listing;
  }

  // ─── PROVIDER: Get own listings ─────────────────────────────────
  async findByProvider(providerId: number) {
    return this.prisma.listing.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        images: { where: { isMain: true }, take: 1 },
      },
    });
  }

  // ─── PROVIDER: Update own listing ───────────────────────────────
  async update(
    id: number,
    providerId: number,
    data: {
      title?: string;
      description?: string;
      price?: number;
      wilaya?: string;
      commune?: string;
      quartier?: string;
      categoryId?: number;
      status?: ListingStatus;
    },
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { provider: { select: { status: true } } },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable.');
    if (listing.providerId !== providerId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres annonces.',
      );
    }

    // Block if provider is not VALIDATED (unless it's a DRAFT update)
    const isTargetingPublished = data.status === 'PUBLISHED';
    if (
      listing.provider.status !== 'VALIDATED' &&
      (listing.status === 'PUBLISHED' || isTargetingPublished)
    ) {
      throw new ForbiddenException(
        'Votre compte est restreint. Vous ne pouvez pas publier ou modifier une annonce publiée.',
      );
    }

    return this.prisma.listing.update({
      where: { id },
      data,
      include: { category: true, images: true },
    });
  }

  // ─── PROVIDER: Delete own listing ───────────────────────────────
  async removeByProvider(id: number, providerId: number) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { provider: { select: { status: true } } },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable.');
    if (listing.providerId !== providerId) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres annonces.',
      );
    }

    // Block if provider is not VALIDATED
    if (listing.provider.status !== 'VALIDATED') {
      throw new ForbiddenException(
        'Votre compte est restreint. Vous ne pouvez pas supprimer cette annonce.',
      );
    }

    // Delete images from storage & DB
    await this.deleteListingImages(id);
    return this.prisma.listing.delete({ where: { id } });
  }

  // ─── ADMIN: List all listings (any status) ──────────────────────
  async findAllAdmin(status?: ListingStatus) {
    return this.prisma.listing.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
        images: { where: { isMain: true }, take: 1 },
      },
    });
  }

  async createByAdmin(data: {
    providerId: number;
    title: string;
    description: string;
    price: number;
    type: ListingType;
    wilaya: string;
    commune: string;
    quartier?: string;
    surface?: number;
    rooms?: number;
    floor?: number;
    categoryId: number;
    status?: ListingStatus;
    images?: string[];
  }) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: data.providerId },
    });
    if (!provider) throw new NotFoundException('Fournisseur introuvable.');

    const listing = await this.prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        type: data.type,
        wilaya: data.wilaya,
        commune: data.commune,
        quartier: data.quartier,
        surface: data.surface,
        rooms: data.rooms,
        floor: data.floor,
        status: data.status || 'DRAFT',
        provider: { connect: { id: data.providerId } },
        category: { connect: { id: data.categoryId } },
        images: {
          create:
            data.images?.map((url, index) => ({
              url,
              isMain: index === 0,
            })) || [],
        },
      },
      include: { category: true, provider: true, images: true },
    });

    await this.notificationsService.broadcast({
      type: NotificationType.NEW_LISTING,
      message: `Nouvelle annonce : "${listing.title}" par ${provider.firstName} ${provider.lastName}`,
    });

    return listing;
  }

  async updateByAdmin(
    id: number,
    data: {
      providerId?: number;
      title?: string;
      description?: string;
      price?: number;
      type?: ListingType;
      wilaya?: string;
      commune?: string;
      quartier?: string;
      surface?: number;
      rooms?: number;
      floor?: number;
      categoryId?: number;
      status?: ListingStatus;
      images?: string[];
    },
  ) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Annonce introuvable.');

    const { providerId, categoryId, images, ...listingData } = data;

    return this.prisma.$transaction(async (tx) => {
      // If updating images, delete old ones from storage first
      if (images) {
        const oldImages = await tx.listingImage.findMany({ where: { listingId: id } });
        for (const image of oldImages) {
          try {
            await this.storageService.deleteFile(image.url);
          } catch (error) {
            console.error(`Failed to delete old image ${image.url}:`, error);
          }
        }
        await tx.listingImage.deleteMany({ where: { listingId: id } });
      }

      return tx.listing.update({
        where: { id },
        data: {
          ...listingData,
          ...(providerId ? { provider: { connect: { id: providerId } } } : {}),
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          ...(images
            ? {
                images: {
                  create: images.map((url, index) => ({
                    url,
                    isMain: index === 0,
                  })),
                },
              }
            : {}),
        },
        include: { category: true, provider: true, images: true },
      });
    });
  }

  // ─── ADMIN: Publish a listing ───────────────────────────────────
  async publish(id: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Annonce introuvable.');
    return this.prisma.listing.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  // ─── ADMIN: Unpublish a listing ─────────────────────────────────
  async unpublish(id: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Annonce introuvable.');
    return this.prisma.listing.update({
      where: { id },
      data: { status: 'UNPUBLISHED' },
    });
  }

  // ─── ADMIN: Delete any listing ──────────────────────────────────
  async removeByAdmin(id: number) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Annonce introuvable.');
    await this.deleteListingImages(id);
    return this.prisma.listing.delete({ where: { id } });
  }
}
