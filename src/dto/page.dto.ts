import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

export class PageDto {
  @ApiProperty({
    description: 'UUID v4 do profile dono da pagina',
    example: 'a1b2c3d4-5678-4abc-8def-1234567890ab',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'Titulo da pagina',
    example: 'Projetos em destaque',
    maxLength: 120,
  })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  @IsString({ message: 'Titulo deve ser uma string' })
  @MaxLength(120, { message: 'Titulo deve ter no maximo 120 caracteres' })
  titulo: string;

  @ApiProperty({
    description: 'Slug em letras minusculas e hifens',
    example: 'projetos-em-destaque',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Slug e obrigatorio' })
  @IsString({ message: 'Slug deve ser uma string' })
  @MaxLength(100, { message: 'Slug deve ter no maximo 100 caracteres' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug deve conter apenas letras minusculas, numeros e hifens',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Posicao da pagina no menu ou listagem',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;
}

export class UpdatePageDto {
  @ApiPropertyOptional({
    description: 'Titulo da pagina',
    example: 'Projetos destacados',
    maxLength: 120,
  })
  @IsOptional()
  @IsString({ message: 'Titulo deve ser uma string' })
  @MaxLength(120, { message: 'Titulo deve ter no maximo 120 caracteres' })
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Slug em letras minusculas e hifens',
    example: 'projetos-destacados',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Slug deve ser uma string' })
  @MaxLength(100, { message: 'Slug deve ter no maximo 100 caracteres' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug deve conter apenas letras minusculas, numeros e hifens',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Posicao da pagina no menu ou listagem',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;
}

export class PageResponseDto {
  @ApiProperty({
    description: 'UUID v4 da pagina',
    example: '5f7e0c2b-b7c3-4e9f-86b5-8f2b77f3c4a0',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile dono da pagina',
    example: 'a1b2c3d4-5678-4abc-8def-1234567890ab',
  })
  profileId: string;

  @ApiProperty({
    description: 'Titulo da pagina',
    example: 'Projetos em destaque',
  })
  titulo: string;

  @ApiProperty({
    description: 'Slug da pagina',
    example: 'projetos-em-destaque',
  })
  slug: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
  })
  ordem: number;

  @ApiProperty({
    description: 'Data de criacao',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualizacao',
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}
