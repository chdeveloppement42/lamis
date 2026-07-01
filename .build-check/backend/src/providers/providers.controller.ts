import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../casl/permissions.guard';
import { CheckPermissions } from '../casl/permissions.decorator';
import { AccountStatus } from '@prisma/client';

import {
  CreateProviderAdminDto,
  UpdateProviderAdminDto,
  UpdateProviderProfileDto,
  UpdateSensitiveFieldsDto,
  ChangePasswordDto,
} from './dto/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  // ─── PROVIDER SELF-MANAGEMENT ───────────────────────────────────
  // These MUST be before :id routes to avoid conflict

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getOwnProfile(@Request() req: any) {
    return this.providersService.getOwnProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: any,
    @Body() updateProviderProfileDto: UpdateProviderProfileDto,
  ) {
    return this.providersService.updateProfile(
      req.user.userId,
      updateProviderProfileDto,
    );
  }

  @Patch('profile/sensitive')
  @UseGuards(JwtAuthGuard)
  updateSensitiveFields(
    @Request() req: any,
    @Body() updateSensitiveFieldsDto: UpdateSensitiveFieldsDto,
  ) {
    return this.providersService.updateSensitiveFields(
      req.user.userId,
      updateSensitiveFieldsDto,
    );
  }

  @Patch('profile/password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.providersService.changeOwnPassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  findAll(@Query('status') status?: AccountStatus, @Query('type') type?: string) {
    return this.providersService.findAll(status, type as any);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  create(@Body() createProviderDto: CreateProviderAdminDto) {
    return this.providersService.createByAdmin(createProviderDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProviderDto: UpdateProviderAdminDto,
  ) {
    return this.providersService.updateByAdmin(id, updateProviderDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  patchUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProviderDto: UpdateProviderAdminDto,
  ) {
    return this.providersService.updateByAdmin(id, updateProviderDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.removeByAdmin(id);
  }

  @Patch(':id/validate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  validate(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.validate(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.reject(id);
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  suspend(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.suspend(id);
  }

  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions({ action: 'manage', subject: 'providers' })
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.reactivate(id);
  }
}
