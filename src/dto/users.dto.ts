import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UserDto {
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

export class UserResponseDto {
  @ApiProperty({
    description: 'UUID v4 do usuario',
    example: '1c1f0a6b-5d49-4a38-9e90-3a6df6f44c55',
  })
  id: string;

  @ApiProperty({
    description: 'Email do usuario',
    example: 'usuario@empresa.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nome completo do usuario',
    example: 'Usuario Teste',
  })
  nome: string;

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
