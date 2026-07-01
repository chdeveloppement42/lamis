import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { listings: true } } },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Catégorie introuvable.');
    return category;
  }

  async create(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Cette catégorie existe déjà.');

    return this.prisma.category.create({ data: { name, slug } });
  }

  async update(id: number, name: string) {
    await this.findOne(id); // throws if not found
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    return this.prisma.category.update({
      where: { id },
      data: { name, slug },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Check if category has listings
    const count = await this.prisma.listing.count({
      where: { categoryId: id },
    });
    if (count > 0) {
      throw new ConflictException(
        `Impossible de supprimer : ${count} annonce(s) utilisent cette catégorie.`,
      );
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
