import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CheckPermissions } from '../casl/permissions.decorator';
import { CreateListingDto, UpdateListingDto } from './dto/listing.dto';
import { ListingStatus, ListingType } from '@prisma/client';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  @Get()
  findPublished(
    @Query('categoryId') categoryId?: string,
    @Query('wilaya') wilaya?: string,
    @Query('commune') commune?: string,
    @Query('type') type?: ListingType,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.findPublished({
      categoryId: categoryId ? +categoryId : undefined,
      wilaya: wilaya || undefined,
      commune: commune || undefined,
      type: type || undefined,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      page: page ? +page : 1,
      limit: limit ? +limit : 12,
    });
  }

  @Get('latest')
  findLatest() {
    return this.listingsService.findLatest();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOnePublished(id);
  }

  // ═══════════════════════════════════════════════════════════════
  // PROVIDER ENDPOINTS (requires JWT, ownership enforced in service)
  // ═══════════════════════════════════════════════════════════════

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(req.user.userId, createListingDto);
  }

  @Get('provider/mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req: any) {
    return this.listingsService.findByProvider(req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListingDto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, req.user.userId, updateListingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.listingsService.removeByProvider(id, req.user.userId);
  }

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'listings' })
  findAllAdmin(@Query('status') status?: ListingStatus) {
    return this.listingsService.findAllAdmin(status);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'listings' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'listings' })
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.unpublish(id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'listings' })
  removeByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.removeByAdmin(id);
  }
}
