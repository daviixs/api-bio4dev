import { ApiProperty } from '@nestjs/swagger';
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
    required: false,
    description: 'UUID v4 do usuario',
    example: '1c1f0a6b-5d49-4a38-9e90-3a6df6f44c55',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'Email do usuario',
    example: 'usuario@empresa.com',
    maxLength: 180,
  })
  @IsEmail({}, { message: 'Email invalido' })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  @MaxLength(180, { message: 'Email deve ter no maximo 180 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuario',
    example: 's3nh@Segura',
    minLength: 6,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha e obrigatoria' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  senha: string;

  @ApiProperty({
    description: 'Nome completo do usuario',
    example: 'Usuario Teste',
    maxLength: 120,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @MaxLength(120, { message: 'Nome deve ter no maximo 120 caracteres' })
  nome: string;
}
