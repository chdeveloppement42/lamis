import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
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
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis.' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'La wilaya est requise.' })
  wilaya: string;

  @IsString()
  @IsNotEmpty({ message: 'La commune est requise.' })
  commune: string;

  @IsString()
  @IsOptional()
  quartier?: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsOptional()
  document?: any;
}
