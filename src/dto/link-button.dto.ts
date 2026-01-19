import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLinkButtonDto {
  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsNotEmpty({ message: 'profileId é obrigatório' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 válido' })
  profileId: string;

  @ApiProperty({
    description: 'Texto do botão',
    example: 'Meu Instagram',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Label é obrigatório' })
  @IsString({ message: 'Label deve ser uma string' })
  @MaxLength(100, { message: 'Label deve ter no máximo 100 caracteres' })
  label: string;

  @ApiProperty({
    description: 'URL do link',
    example: 'https://instagram.com/meuuser',
  })
  @IsNotEmpty({ message: 'URL é obrigatória' })
  @IsString({ message: 'URL deve ser uma string' })
  url: string;

  @ApiPropertyOptional({
    description: 'Subtexto opcional abaixo do botão',
    example: 'Siga-me para dicas diárias',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Subtext deve ser uma string' })
  @MaxLength(200, { message: 'Subtext deve ter no máximo 200 caracteres' })
  subtext?: string;

  @ApiPropertyOptional({
    description: 'Ícone do botão (ex: logos:instagram)',
    example: 'logos:instagram',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Icon deve ser uma string' })
  @MaxLength(50, { message: 'Icon deve ter no máximo 50 caracteres' })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Estilo CSS customizado do botão',
    example: 'bg-gradient-to-r from-purple-500 to-pink-500',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Style deve ser uma string' })
  @MaxLength(100, { message: 'Style deve ter no máximo 100 caracteres' })
  style?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  @Min(0, { message: 'Ordem deve ser maior ou igual a 0' })
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Se o botão está ativo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}

export class UpdateLinkButtonDto {
  @ApiPropertyOptional({
    description: 'Texto do botão',
    example: 'Meu Instagram Atualizado',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Label deve ser uma string' })
  @MaxLength(100, { message: 'Label deve ter no máximo 100 caracteres' })
  label?: string;

  @ApiPropertyOptional({
    description: 'URL do link',
    example: 'https://instagram.com/novousuario',
  })
  @IsOptional()
  @IsString({ message: 'URL deve ser uma string' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Subtexto opcional abaixo do botão',
    example: 'Novidades todos os dias',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Subtext deve ser uma string' })
  @MaxLength(200, { message: 'Subtext deve ter no máximo 200 caracteres' })
  subtext?: string;

  @ApiPropertyOptional({
    description: 'Ícone do botão',
    example: 'logos:tiktok',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Icon deve ser uma string' })
  @MaxLength(50, { message: 'Icon deve ter no máximo 50 caracteres' })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Estilo CSS customizado do botão',
    example: 'bg-blue-500 hover:bg-blue-600',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Style deve ser uma string' })
  @MaxLength(100, { message: 'Style deve ter no máximo 100 caracteres' })
  style?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  @Min(0, { message: 'Ordem deve ser maior ou igual a 0' })
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Se o botão está ativo',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}

export class LinkButtonResponseDto {
  @ApiProperty({
    description: 'UUID v4 do botão',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Texto do botão',
    example: 'Meu Instagram',
  })
  label: string;

  @ApiProperty({
    description: 'URL do link',
    example: 'https://instagram.com/meuuser',
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Subtexto do botão',
    example: 'Siga-me para dicas',
  })
  subtext?: string;

  @ApiPropertyOptional({
    description: 'Ícone do botão',
    example: 'logos:instagram',
  })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Estilo CSS do botão',
    example: 'bg-gradient-to-r from-purple-500 to-pink-500',
  })
  style?: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 0,
  })
  ordem: number;

  @ApiProperty({
    description: 'Se o botão está ativo',
    example: true,
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}
