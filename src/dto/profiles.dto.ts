import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

const templateOptions = ['template_01', 'template_02', 'template_03'] as const;
const colorOptions = ['LIGHT', 'DARK'] as const;

export enum Colors {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export class CreateProfileDto {
  @ApiProperty({
    description: 'UUID v4 do usuario dono do profile',
    example: '2b6f7ad4-ef1b-4527-b8e1-5893d0ac8b3b',
  })
  @IsNotEmpty({ message: 'userId e obrigatorio' })
  @IsUUID('4', { message: 'userId deve ser um UUID v4 valido' })
  userId: string;

  @ApiProperty({
    description: 'Nome de usuario publico',
    example: 'ana.silva',
    maxLength: 40,
  })
  @IsNotEmpty({ message: 'Username e obrigatorio' })
  @IsString({ message: 'Username deve ser uma string' })
  @MaxLength(40, { message: 'Username deve ter no maximo 40 caracteres' })
  username: string;

  @ApiPropertyOptional({
    description: 'Biografia curta do perfil',
    example: 'Desenvolvedora full stack e mentora de carreira.',
  })
  @IsOptional()
  @IsString({ message: 'Bio deve ser uma string' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL do avatar',
    example: 'https://cdn.site.com/avatar.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL invalida' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Tema do portfolio (claro ou escuro)',
    enum: colorOptions,
    default: 'LIGHT',
    example: 'DARK',
  })
  @IsOptional()
  @IsEnum(Colors, { message: 'Theme deve ser LIGHT ou DARK' })
  theme?: Colors;

  @ApiPropertyOptional({
    description: 'Cor principal do portfolio em hexadecimal',
    example: '#FF5733',
    maxLength: 7,
  })
  @IsOptional()
  @IsString({ message: 'mainColor deve ser uma string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'mainColor deve ser um hexadecimal valido (ex: #FF5733)',
  })
  mainColor?: string;

  @ApiProperty({
    description: 'Template escolhido para o perfil',
    enum: templateOptions,
  })
  @IsNotEmpty({ message: 'Template e obrigatorio' })
  @IsEnum(['template_01', 'template_02', 'template_03'], {
    message: 'Template deve ser template_01, template_02 ou template_03',
  })
  templateType: (typeof templateOptions)[number];

  @ApiPropertyOptional({
    description: 'Se o perfil esta publicado',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Published deve ser um booleano' })
  published?: boolean;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nome de usuario publico',
    example: 'ana.silva.dev',
    maxLength: 40,
  })
  @IsOptional()
  @IsString({ message: 'Username deve ser uma string' })
  @MaxLength(40, { message: 'Username deve ter no maximo 40 caracteres' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Biografia curta do perfil',
    example: 'Desenvolvedora full stack e mentora de carreira.',
  })
  @IsOptional()
  @IsString({ message: 'Bio deve ser uma string' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL do avatar',
    example: 'https://cdn.site.com/avatar-novo.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL invalida' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Tema do portfolio (claro ou escuro)',
    enum: colorOptions,
    example: 'LIGHT',
  })
  @IsOptional()
  @IsEnum(Colors, { message: 'Theme deve ser LIGHT ou DARK' })
  theme?: Colors;

  @ApiPropertyOptional({
    description: 'Cor principal do portfolio em hexadecimal',
    example: '#4A90E2',
    maxLength: 7,
  })
  @IsOptional()
  @IsString({ message: 'mainColor deve ser uma string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'mainColor deve ser um hexadecimal valido (ex: #FF5733)',
  })
  mainColor?: string;

  @ApiPropertyOptional({
    description: 'Template escolhido para o perfil',
    enum: templateOptions,
  })
  @IsOptional()
  @IsEnum(['template_01', 'template_02', 'template_03'], {
    message: 'Template deve ser template_01, template_02 ou template_03',
  })
  templateType?: (typeof templateOptions)[number];

  @ApiPropertyOptional({
    description: 'Se o perfil esta publicado',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Published deve ser um booleano' })
  published?: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({
    description: 'UUID v4 do profile',
    example: '6c6f7f19-9d34-4b22-9a64-8d7ec713ef5c',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do usuario dono do profile',
    example: '2b6f7ad4-ef1b-4527-b8e1-5893d0ac8b3b',
  })
  userId: string;

  @ApiProperty({
    description: 'Nome de usuario publico',
    example: 'ana.silva',
  })
  username: string;

  @ApiProperty({
    description: 'Biografia curta do perfil',
    example: 'Desenvolvedora full stack e mentora de carreira.',
  })
  bio?: string;

  @ApiProperty({
    description: 'URL do avatar',
    example: 'https://cdn.site.com/avatar.png',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Tema do portfolio',
    example: 'DARK',
  })
  theme?: Colors;

  @ApiProperty({
    description: 'Cor principal do portfolio',
    example: '#FF5733',
  })
  mainColor?: string;

  @ApiProperty({
    description: 'Template escolhido',
    example: 'template_01',
  })
  templateType: string;

  @ApiProperty({
    description: 'Se o perfil esta publicado',
    example: true,
  })
  published: boolean;

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
