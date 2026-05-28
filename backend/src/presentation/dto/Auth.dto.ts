import { IsString, IsEmail, MinLength } from 'class-validator';

/**
 * DTO para login
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * DTO para registro
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

/**
 * Respuesta de autenticación
 */
export class AuthResponseDto {
  token!: string;
  user!: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}