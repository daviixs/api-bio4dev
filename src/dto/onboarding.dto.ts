import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const templateOptions = [
  'template_01',
  'template_02',
  'template_03',
  'template_04',
  'template_05',
  'template_06',
  'template_07',
  'template_08',
  'template_09',
  'template_10',
  'template_11',
  'template_12',
  'template_13',
  'template_14',
] as const;

export class FinalizeOnboardingLinkDto {
  @ApiProperty({
    description: 'Label do link adicional',
    example: 'Website',
  })
  @IsString({ message: 'label deve ser uma string' })
  @IsNotEmpty({ message: 'label é obrigatório' })
  @MaxLength(100, { message: 'label deve ter no máximo 100 caracteres' })
  label: string;

  @ApiProperty({
    description: 'URL do link adicional',
    example: 'https://example.com',
  })
  @IsString({ message: 'url deve ser uma string' })
  @IsNotEmpty({ message: 'url é obrigatória' })
  @MaxLength(500, { message: 'url deve ter no máximo 500 caracteres' })
  url: string;
}

export class FinalizeOnboardingDto {
  @ApiProperty({
    description: 'Identificador local do rascunho',
    example: 'draft-1234abcd',
  })
  @IsString({ message: 'draftId deve ser uma string' })
  @IsNotEmpty({ message: 'draftId é obrigatório' })
  @MaxLength(100, { message: 'draftId deve ter no máximo 100 caracteres' })
  draftId: string;

  @ApiProperty({
    description: 'Template escolhido',
    enum: templateOptions,
    example: 'template_04',
  })
  @IsString({ message: 'templateType deve ser uma string' })
  @Matches(/^template_\d{2}$/, {
    message: 'templateType deve estar entre template_01 e template_14',
  })
  templateType: (typeof templateOptions)[number];

  @ApiProperty({
    description: 'Slug público do profile',
    example: 'meu-link',
  })
  @IsString({ message: 'slug deve ser uma string' })
  @IsNotEmpty({ message: 'slug é obrigatório' })
  @Matches(/^[a-z0-9-]{3,60}$/, {
    message:
      'slug deve ter 3-60 caracteres e conter apenas letras minúsculas, números e hífens',
  })
  slug: string;

  @ApiProperty({
    description: 'Nome de exibição coletado no onboarding',
    example: 'Meu Nome',
  })
  @IsString({ message: 'displayName deve ser uma string' })
  @IsNotEmpty({ message: 'displayName é obrigatório' })
  @MaxLength(80, { message: 'displayName deve ter no máximo 80 caracteres' })
  displayName: string;

  @ApiPropertyOptional({
    description: 'Bio curta do perfil',
    example: 'Criador de conteúdo e streamer.',
  })
  @IsOptional()
  @IsString({ message: 'bio deve ser uma string' })
  @MaxLength(500, { message: 'bio deve ter no máximo 500 caracteres' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Avatar informado no onboarding',
    example: 'https://cdn.example.com/avatar.png',
  })
  @IsOptional()
  @IsString({ message: 'avatarDataUrl deve ser uma string' })
  @MaxLength(500, {
    message: 'avatarDataUrl deve ter no máximo 500 caracteres',
  })
  avatarDataUrl?: string;

  @ApiPropertyOptional({
    description: 'Plataformas selecionadas no onboarding',
    type: [String],
    example: ['instagram', 'youtube'],
  })
  @IsOptional()
  @IsArray({ message: 'selectedPlatforms deve ser um array' })
  @ArrayMaxSize(20, { message: 'selectedPlatforms deve ter no máximo 20 itens' })
  @IsString({ each: true, message: 'selectedPlatforms deve conter strings' })
  selectedPlatforms?: string[];

  @ApiPropertyOptional({
    description: 'Mapa de plataforma para valor informado no formulário',
    example: {
      instagram: '@meuuser',
      youtube: 'youtube.com/@meuuser',
    },
  })
  @IsOptional()
  @IsObject({ message: 'platformLinks deve ser um objeto' })
  platformLinks?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Links adicionais do onboarding',
    type: [FinalizeOnboardingLinkDto],
  })
  @IsOptional()
  @IsArray({ message: 'additionalLinks deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => FinalizeOnboardingLinkDto)
  additionalLinks?: FinalizeOnboardingLinkDto[];
}

export class FinalizeOnboardingResponseDto {
  @ApiProperty({
    description: 'UUID do profile finalizado',
    example: '2b6f7ad4-ef1b-4527-b8e1-5893d0ac8b3b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Template final do profile',
    example: 'template_04',
  })
  templateType: string;

  @ApiProperty({
    description: 'Rota para abrir o preview logo após finalizar',
    example: '/dashboard/influencer/template_04/uuid/preview',
  })
  redirectTo: string;

  @ApiProperty({
    description: 'Plataformas ignoradas por falta de suporte na API atual',
    type: [String],
    example: ['spotify', 'threads'],
  })
  skippedPlatforms: string[];
}
