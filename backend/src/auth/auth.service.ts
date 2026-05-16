import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { NotificationType } from '@prisma/client';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private notificationsService: NotificationsService,
    private storageService: StorageService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    let user: any = await this.prisma.admin.findUnique({
      where: { email },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
    let userType: 'ADMIN' | 'PROVIDER' = 'ADMIN';

    if (!user) {
      user = await this.prisma.provider.findUnique({ where: { email } });
      userType = 'PROVIDER';
    }

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Identifiants invalides');

    if (userType === 'ADMIN' && user.status === 'SUSPENDED') {
      throw new UnauthorizedException(
        'Votre compte administrateur a été suspendu.',
      );
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      userType,
      status: user.status,
      roleId: user.roleId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.signRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType,
        status: user.status,
        roleName: userType === 'ADMIN' ? user.role.name : null,
        isSuperAdmin: userType === 'ADMIN' ? user.isSuperAdmin : false,
        permissions:
          userType === 'ADMIN'
            ? user.role.permissions.map((p: any) => p.permission.action)
            : [],
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      // Strip JWT metadata fields before re-signing
      const { userId, email, userType, status, roleId } = payload;
      const newPayload: JwtPayload = {
        userId,
        email,
        userType,
        status,
        roleId,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.signRefreshToken(newPayload);

      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reconnecter.',
      );
    }
  }

  async register(registerDto: RegisterDto, documentFile?: Express.Multer.File) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      wilaya,
      commune,
      quartier,
    } = registerDto;

    const existingProvider = await this.prisma.provider.findUnique({
      where: { email },
    });
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingProvider || existingAdmin) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    let finalDocumentUrl = registerDto.documentUrl || '';

    if (documentFile) {
      const extension = path.extname(documentFile.originalname) || '.pdf';
      const filename = `${uuidv4()}${extension}`;
      finalDocumentUrl = await this.storageService.saveFile(
        documentFile.buffer,
        filename,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const provider = await this.prisma.provider.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        wilaya,
        commune,
        quartier,
        documentUrl: finalDocumentUrl,
        status: 'PENDING',
      },
    });

    await this.notificationsService.broadcast({
      type: NotificationType.NEW_PROVIDER,
      message: `Nouveau fournisseur inscrit : ${firstName} ${lastName} (${email})`,
    });

    return {
      message:
        'Compte créé avec succès. En attente de validation par un administrateur.',
      providerId: provider.id,
    };
  }

  private signRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as StringValue,
    });
  }
}
