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
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CheckPermissions } from '../casl/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ─── LIST ALL ROLES ────────────────────────────────────────────
  @Get()
  @CheckPermissions({ action: 'read', subject: 'roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  // ─── GET ALL PERMISSIONS ───────────────────────────────────────
  @Get('permissions')
  @CheckPermissions({ action: 'manage', subject: 'permissions' })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  // ─── GET SINGLE ROLE ──────────────────────────────────────────
  @Get(':id')
  @CheckPermissions({ action: 'manage', subject: 'permissions' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  // ─── CREATE ROLE ───────────────────────────────────────────────
  @Post()
  @CheckPermissions({ action: 'manage', subject: 'permissions' })
  create(@Body() body: { name: string; permissionIds: number[] }) {
    return this.rolesService.create(body);
  }

  // ─── UPDATE ROLE ───────────────────────────────────────────────
  @Put(':id')
  @CheckPermissions({ action: 'manage', subject: 'permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; permissionIds?: number[] },
  ) {
    return this.rolesService.update(id, body);
  }

  // ─── DELETE ROLE ───────────────────────────────────────────────
  @Delete(':id')
  @CheckPermissions({ action: 'manage', subject: 'permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
