import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export enum Plataforma {
  instagram = 'instagram',
  tiktok = 'tiktok',
  youtube = 'youtube',
  github = 'github',
  linkedin = 'linkedin',
  twitter = 'twitter',
}

export class CreateSocialDto {
  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'Plataforma da rede social',
    enum: Plataforma,
    example: 'instagram',
  })
  @IsNotEmpty({ message: 'Plataforma e obrigatoria' })
  @IsEnum(Plataforma, { message: 'Plataforma invalida' })
  plataforma: Plataforma;

  @ApiProperty({
    description: 'URL do perfil na rede social',
    example: 'https://instagram.com/usuario',
  })
  @IsNotEmpty({ message: 'URL e obrigatoria' })
  @IsString({ message: 'URL deve ser uma string' })
  @IsUrl({}, { message: 'URL deve ser valida' })
  url: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;
}

export class UpdateSocialDto {
  @ApiPropertyOptional({
    description: 'Plataforma da rede social',
    enum: Plataforma,
    example: 'linkedin',
  })
  @IsOptional()
  @IsEnum(Plataforma, { message: 'Plataforma invalida' })
  plataforma?: Plataforma;

  @ApiPropertyOptional({
    description: 'URL do perfil na rede social',
    example: 'https://linkedin.com/in/usuario',
  })
  @IsOptional()
  @IsString({ message: 'URL deve ser uma string' })
  @IsUrl({}, { message: 'URL deve ser valida' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;
}

export class SocialResponseDto {
  @ApiProperty({
    description: 'UUID v4 do registro social',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Plataforma da rede social',
    enum: Plataforma,
    example: 'instagram',
  })
  plataforma: Plataforma;

  @ApiProperty({
    description: 'URL do perfil na rede social',
    example: 'https://instagram.com/usuario',
  })
  url: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
  })
  ordem: number;

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
