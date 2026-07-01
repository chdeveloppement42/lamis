import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide.' })
  @IsNotEmpty({ message: "L'adresse email est requise." })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type d utilisateur est requis.' })
  userType!: 'ADMIN' | 'PROVIDER';
}
