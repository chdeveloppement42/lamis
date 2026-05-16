import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './password-reset.service';

const REFRESH_COOKIE = 'refresh_token';

type AuthLoginServiceResponse = {
  refresh_token: string;
  [key: string]: unknown;
};

type AuthRefreshServiceResponse = {
  access_token: string;
  refresh_token?: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = (await this.authService.login(
      loginDto,
    )) as unknown as AuthLoginServiceResponse;

    this.setRefreshCookie(res, result.refresh_token);

    // Do not return refresh_token
    const { refresh_token: _refreshToken, ...response } = result;
    void _refreshToken;

    return response;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;

    if (!token) {
      throw new UnauthorizedException(
        'Session expirée. Veuillez vous reconnecter.',
      );
    }

    const result = (await this.authService.refresh(
      token,
    )) as unknown as AuthRefreshServiceResponse;

    if (result.refresh_token) {
      this.setRefreshCookie(res, result.refresh_token);
    }

    return { access_token: result.access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { message: 'Déconnecté avec succès.' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('document'))
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() document?: Express.Multer.File,
  ) {
    return this.authService.register(registerDto, document);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.forgot(dto);
  }

  @Post('send-test-email')
  @HttpCode(HttpStatus.OK)
  async sendTestEmail(@Body('email') email: string) {
    return this.passwordResetService.sendTestEmail(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.reset(dto);
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/api/auth',
    });
  }
}
