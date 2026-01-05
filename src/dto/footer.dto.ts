import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateFooterDto {
  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'Titulo do rodapé',
    example: 'Contato',
  })
  @IsNotEmpty({ message: 'Title e obrigatorio' })
  @IsString({ message: 'Title deve ser uma string' })
  title: string;

  @ApiProperty({
    description: 'Subtitulo do rodapé',
    example: 'Entre em contato para oportunidades',
  })
  @IsNotEmpty({ message: 'Subtitle e obrigatorio' })
  @IsString({ message: 'Subtitle deve ser uma string' })
  subtitle: string;

  @ApiPropertyOptional({
    description: 'Email de contato',
    example: 'contato@exemplo.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Link do GitHub',
    example: 'https://github.com/usuario',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Github deve ser uma URL valida' })
  github?: string;

  @ApiPropertyOptional({
    description: 'Link do LinkedIn',
    example: 'https://linkedin.com/in/usuario',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Linkedin deve ser uma URL valida' })
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Link do Twitter/X',
    example: 'https://twitter.com/usuario',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Twitter deve ser uma URL valida' })
  twitter?: string;

  @ApiProperty({
    description: 'Nome para copyright',
    example: 'Meu Nome',
  })
  @IsNotEmpty({ message: 'CopyrightName e obrigatorio' })
  @IsString({ message: 'CopyrightName deve ser uma string' })
  copyrightName: string;
}

export class UpdateFooterDto {
  @ApiPropertyOptional({
    description: 'Titulo do rodapé',
    example: 'Entre em Contato',
  })
  @IsOptional()
  @IsString({ message: 'Title deve ser uma string' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Subtitulo do rodapé',
    example: 'Estou disponivel para novos projetos',
  })
  @IsOptional()
  @IsString({ message: 'Subtitle deve ser uma string' })
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Email de contato',
    example: 'novo.contato@exemplo.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Link do GitHub',
    example: 'https://github.com/novo-usuario',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Github deve ser uma URL valida' })
  github?: string;

  @ApiPropertyOptional({
    description: 'Link do LinkedIn',
    example: 'https://linkedin.com/in/novo-usuario',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Linkedin deve ser uma URL valida' })
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Link do Twitter/X',
    example: 'https://twitter.com/novo-usuario',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Twitter deve ser uma URL valida' })
  twitter?: string;

  @ApiPropertyOptional({
    description: 'Nome para copyright',
    example: 'Novo Nome',
  })
  @IsOptional()
  @IsString({ message: 'CopyrightName deve ser uma string' })
  copyrightName?: string;
}

export class FooterResponseDto {
  @ApiProperty({
    description: 'UUID v4 do footer',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Titulo do rodapé',
    example: 'Contato',
  })
  title: string;

  @ApiProperty({
    description: 'Subtitulo do rodapé',
    example: 'Entre em contato para oportunidades',
  })
  subtitle: string;

  @ApiProperty({
    description: 'Email de contato',
    example: 'contato@exemplo.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Link do GitHub',
    example: 'https://github.com/usuario',
  })
  github?: string;

  @ApiProperty({
    description: 'Link do LinkedIn',
    example: 'https://linkedin.com/in/usuario',
  })
  linkedin?: string;

  @ApiProperty({
    description: 'Link do Twitter/X',
    example: 'https://twitter.com/usuario',
  })
  twitter?: string;

  @ApiProperty({
    description: 'Nome para copyright',
    example: 'Meu Nome',
  })
  copyrightName: string;

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
