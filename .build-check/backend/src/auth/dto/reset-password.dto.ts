import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Le token est requis.' })
  token!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis.' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  newPassword!: string;

  @IsEnum(['ADMIN', 'PROVIDER'])
  userType!: 'ADMIN' | 'PROVIDER';
}
