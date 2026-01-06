import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class LegendaDto {
  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'URL da imagem que sera legendada',
    example: 'https://cdn.site.com/avatar.png',
  })
  @IsNotEmpty({ message: 'Legenda foto e obrigatoria' })
  @IsString({ message: 'Legenda foto deve ser uma string' })
  @IsUrl({}, { message: 'Legenda foto deve ser uma URL valida' })
  legendaFoto: string;

  @ApiPropertyOptional({
    description: 'Saudacao inicial (ex: Ola, eu sou)',
    example: 'Ola, eu sou',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Greeting deve ser uma string' })
  @MaxLength(100, { message: 'Greeting deve ter no maximo 100 caracteres' })
  greeting?: string;

  @ApiProperty({
    description: 'Nome da pessoa ou perfil',
    example: 'Ana Silva',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no maximo 255 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Titulo principal exibido na pagina',
    example: 'Desenvolvedora Full Stack',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  @IsString({ message: 'Titulo deve ser uma string' })
  @MaxLength(255, { message: 'Titulo deve ter no maximo 255 caracteres' })
  titulo: string;

  @ApiProperty({
    description: 'Subtitulo ou chamada auxiliar',
    example: 'Apaixonada por tecnologia e educacao',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Subtitulo e obrigatorio' })
  @IsString({ message: 'Subtitulo deve ser uma string' })
  @MaxLength(255, { message: 'Subtitulo deve ter no maximo 255 caracteres' })
  subtitulo: string;

  @ApiProperty({
    description: 'Descricao curta do perfil',
    example: 'Mentora de carreira, criadora de conteudo e dev full stack.',
  })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  @IsString({ message: 'Descricao deve ser uma string' })
  descricao: string;
}

export class UpdateLegendaDto {
  @ApiPropertyOptional({
    description: 'URL da imagem que sera legendada',
    example: 'https://cdn.site.com/avatar-novo.png',
  })
  @IsOptional()
  @IsString({ message: 'Legenda foto deve ser uma string' })
  @IsUrl({}, { message: 'Legenda foto deve ser uma URL valida' })
  legendaFoto?: string;

  @ApiPropertyOptional({
    description: 'Saudacao inicial (ex: Ola, eu sou)',
    example: 'Oi, eu sou',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Greeting deve ser uma string' })
  @MaxLength(100, { message: 'Greeting deve ter no maximo 100 caracteres' })
  greeting?: string;

  @ApiPropertyOptional({
    description: 'Nome da pessoa ou perfil',
    example: 'Ana Silva Santos',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no maximo 255 caracteres' })
  nome?: string;

  @ApiPropertyOptional({
    description: 'Titulo principal exibido na pagina',
    example: 'Desenvolvedora Senior Full Stack',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Titulo deve ser uma string' })
  @MaxLength(255, { message: 'Titulo deve ter no maximo 255 caracteres' })
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Subtitulo ou chamada auxiliar',
    example: 'Especialista em React e Node.js',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Subtitulo deve ser uma string' })
  @MaxLength(255, { message: 'Subtitulo deve ter no maximo 255 caracteres' })
  subtitulo?: string;

  @ApiPropertyOptional({
    description: 'Descricao curta do perfil',
    example: 'Mentora de carreira e tech lead.',
  })
  @IsOptional()
  @IsString({ message: 'Descricao deve ser uma string' })
  descricao?: string;
}

export class LegendaResponseDto {
  @ApiProperty({
    description: 'UUID v4 da legenda',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'URL da imagem que sera legendada',
    example: 'https://cdn.site.com/avatar.png',
  })
  legendaFoto: string;

  @ApiProperty({
    description: 'Saudacao inicial',
    example: 'Ola, eu sou',
  })
  greeting?: string;

  @ApiProperty({
    description: 'Nome da pessoa ou perfil',
    example: 'Ana Silva',
  })
  nome: string;

  @ApiProperty({
    description: 'Titulo principal exibido na pagina',
    example: 'Desenvolvedora Full Stack',
  })
  titulo: string;

  @ApiProperty({
    description: 'Subtitulo ou chamada auxiliar',
    example: 'Apaixonada por tecnologia e educacao',
  })
  subtitulo: string;

  @ApiProperty({
    description: 'Descricao curta do perfil',
    example: 'Mentora de carreira, criadora de conteudo e dev full stack.',
  })
  descricao: string;

  @ApiProperty({
    description: 'Data de criacao do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualizacao do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}
