import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum UserRole {
  USER = 'USER',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuario',
    example: 'usuario@empresa.com',
    maxLength: 180,
  })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  @MaxLength(180, { message: 'Email deve ter no maximo 180 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuario',
    example: 's3nh@Segura',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Senha e obrigatoria' })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  senha: string;

  @ApiProperty({
    description: 'Nome completo do usuario',
    example: 'Usuario Teste',
    maxLength: 120,
  })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(120, { message: 'Nome deve ter no maximo 120 caracteres' })
  nome: string;

  @ApiPropertyOptional({
    description: 'Papel do usuario (fixo em USER na criacao)',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser USER ou PLATFORM_ADMIN' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Username do usuario',
    example: 'john_doe',
    maxLength: 60,
  })
  @IsOptional()
  @IsString({ message: 'Username deve ser uma string' })
  @MaxLength(60, { message: 'Username deve ter no maximo 60 caracteres' })
  username?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email do usuario',
    example: 'usuario.atualizado@empresa.com',
    maxLength: 180,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  @MaxLength(180, { message: 'Email deve ter no maximo 180 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha do usuario',
    example: 'N0v@Senh@',
    minLength: 6,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  senha?: string;

  @ApiPropertyOptional({
    description: 'Nome completo do usuario',
    example: 'Usuario Teste Atualizado',
    maxLength: 120,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(120, { message: 'Nome deve ter no maximo 120 caracteres' })
  nome?: string;

  @ApiPropertyOptional({
    description: 'Papel do usuario',
    enum: UserRole,
    example: UserRole.PLATFORM_ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser USER ou PLATFORM_ADMIN' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Username do usuario',
    example: 'john_doe',
    maxLength: 60,
  })
  @IsOptional()
  @IsString({ message: 'Username deve ser uma string' })
  @MaxLength(60, { message: 'Username deve ter no maximo 60 caracteres' })
  username?: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuario',
    example: 'usuario@empresa.com',
  })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuario',
    example: 's3nh@Segura',
  })
  @IsNotEmpty({ message: 'Senha e obrigatoria' })
  @IsString({ message: 'Senha deve ser uma string' })
  senha: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Senha atual do usuario',
    example: 's3nh@Antiga',
  })
  @IsNotEmpty({ message: 'Senha atual e obrigatoria' })
  @IsString({ message: 'Senha atual deve ser uma string' })
  oldPassword: string;

  @ApiProperty({
    description: 'Nova senha do usuario',
    example: 'N0v@S3nh@Segura',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Nova senha e obrigatoria' })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @MinLength(6, { message: 'Nova senha deve ter no minimo 6 caracteres' })
  newPassword: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'UUID v4 do usuario',
    example: '1c1f0a6b-5d49-4a38-9e90-3a6df6f44c55',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Email mascarado do usuario (sem plaintext)',
    example: 'u***@g***.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Nome completo do usuario',
    example: 'Usuario Teste',
  })
  nome: string;

  @ApiPropertyOptional({
    description: 'Username do usuario',
    example: 'john_doe',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Preferência de email notifications',
    example: true,
  })
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Preferência de marketing emails',
    example: false,
  })
  marketingEmails?: boolean;

  @ApiPropertyOptional({
    description: 'Preferência de alertas de segurança',
    example: true,
  })
  securityAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Idioma preferido', example: 'en' })
  language?: string;

  @ApiPropertyOptional({ description: 'Timezone preferido', example: 'UTC' })
  timezone?: string;

  @ApiPropertyOptional({ description: '2FA habilitado', example: false })
  twoFactorEnabled?: boolean;

  @ApiProperty({
    description: 'Papel do usuario',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Data de criacao',
    example: '2025-12-11T22:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualizacao',
    example: '2025-12-11T22:00:00.000Z',
  })
  updatedAt: Date;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Receber notificações por email',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'emailNotifications deve ser booleano' })
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Receber emails de marketing',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'marketingEmails deve ser booleano' })
  marketingEmails?: boolean;

  @ApiPropertyOptional({ description: 'Alertas de segurança', example: true })
  @IsOptional()
  @IsBoolean({ message: 'securityAlerts deve ser booleano' })
  securityAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Idioma preferido', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Timezone preferido', example: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
