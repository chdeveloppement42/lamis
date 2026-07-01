import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CheckPermissions } from '../casl/permissions.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // PUBLIC — anyone can list categories
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // PUBLIC — anyone can view a single category
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  // ADMIN — requires manage:categories permission
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'categories' })
  create(@Body('name') name: string) {
    return this.categoriesService.create(name);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'categories' })
  update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
    return this.categoriesService.update(id, name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'categories' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
