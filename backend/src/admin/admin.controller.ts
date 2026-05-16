import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CheckPermissions } from '../casl/permissions.decorator';

import {
  CreateAdminDto,
  UpdateAdminDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── DASHBOARD STATS ──────────────────────────────────────────
  @Get('dashboard-stats')
  @CheckPermissions({ action: 'view', subject: 'dashboard' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ─── CHANGE OWN PASSWORD ────────────────────────────────────────
  @Patch('profile/password')
  changeOwnPassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.adminService.changeOwnPassword(
      (req.user as any).userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  // ─── LIST ALL ADMINS ───────────────────────────────────────────
  @Get('users')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  findAll() {
    return this.adminService.findAll();
  }

  // ─── GET SINGLE ADMIN ─────────────────────────────────────────
  @Get('users/:id')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }

  // ─── CREATE ADMIN ─────────────────────────────────────────────
  @Post('users')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  create(@Req() req: Request, @Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create((req.user as any).userId, createAdminDto);
  }

  // ─── UPDATE ADMIN ─────────────────────────────────────────────
  @Patch('users/:id')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(id, updateAdminDto);
  }

  // ─── SUSPEND ADMIN ────────────────────────────────────────────
  @Patch('users/:id/suspend')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  suspend(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.suspend(id);
  }

  // ─── REACTIVATE ADMIN ─────────────────────────────────────────
  @Patch('users/:id/reactivate')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reactivate(id);
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────
  @Patch('users/:id/reset-password')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.adminService.resetPassword(id, resetPasswordDto.newPassword);
  }

  // ─── DELETE ADMIN ──────────────────────────────────────────────
  @Delete('users/:id')
  @CheckPermissions({ action: 'manage', subject: 'admins' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.delete(id);
  }
}
