import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  lastName: string;

  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  @IsNotEmpty({ message: "L'adresse email est requise." })
  email: string;

  @IsString()
  @MinLength(4, {
    message: 'Le mot de passe doit contenir au moins 4 caractères.',
  })
  password: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Le rôle est requis.' })
  roleId: number;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  roleId?: number;
}

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  email?: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(4, {
    message: 'Le mot de passe doit contenir au moins 4 caractères.',
  })
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(4, {
    message: 'Le nouveau mot de passe doit contenir au moins 4 caractères.',
  })
  newPassword: string;
}
