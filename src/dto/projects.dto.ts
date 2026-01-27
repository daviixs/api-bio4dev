import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProjetoDto {
  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'Nome do projeto',
    example: 'Portfolio Pessoal',
  })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsString({ message: 'Nome deve ser uma string' })
  nome: string;

  @ApiProperty({
    description: 'Descricao detalhada do projeto',
    example: 'Um portfolio desenvolvido com React e NestJS.',
  })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  @IsString({ message: 'Descricao deve ser uma string' })
  descricao: string;

  @ApiPropertyOptional({
    description: 'URL do GIF ou imagem de capa',
    example: 'https://site.com/demo.gif',
  })
  @IsOptional()
  @IsString({ message: 'Gif deve ser uma string' })
  gif?: string;

  @ApiPropertyOptional({
    description: 'Link para demonstracao online',
    example: 'https://meu-projeto.com',
  })
  @IsOptional()
  @IsString({ message: 'Demo link deve ser uma string' })
  demoLink?: string;

  @ApiPropertyOptional({
    description: 'Link para o repositorio de codigo',
    example: 'https://github.com/usuario/repo',
  })
  @IsOptional()
  @IsString({ message: 'Code link deve ser uma string' })
  codeLink?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  @Min(0, { message: 'A ordem deve ser maior ou igual a 0' })
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Tags/tecnologias usadas no projeto',
    example: ['React', 'TypeScript', 'Node.js'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags deve ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];
}

export class UpdateProjetoDto {
  @ApiPropertyOptional({
    description: 'Nome do projeto',
    example: 'Portfolio Pessoal V2',
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  nome?: string;

  @ApiPropertyOptional({
    description: 'Descricao detalhada do projeto',
    example: 'Portfolio atualizado com novas funcionalidades.',
  })
  @IsOptional()
  @IsString({ message: 'Descricao deve ser uma string' })
  descricao?: string;

  @ApiPropertyOptional({
    description: 'URL do GIF ou imagem de capa',
    example: 'https://site.com/demo-novo.gif',
  })
  @IsOptional()
  @ValidateIf((o) => o.gif !== '' && o.gif !== null && o.gif !== undefined)
  @IsString({ message: 'Gif deve ser uma string' })
  @IsUrl({}, { message: 'Gif deve ser uma URL valida' })
  gif?: string;

  @ApiPropertyOptional({
    description: 'Link para demonstracao online',
    example: 'https://meu-projeto-novo.com',
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.demoLink !== '' && o.demoLink !== null && o.demoLink !== undefined,
  )
  @IsString({ message: 'Demo link deve ser uma string' })
  @IsUrl({}, { message: 'Demo link deve ser uma URL valida' })
  demoLink?: string;

  @ApiPropertyOptional({
    description: 'Link para o repositorio de codigo',
    example: 'https://github.com/usuario/repo-novo',
  })
  @IsOptional()
  @ValidateIf(
    (o) => o.codeLink !== '' && o.codeLink !== null && o.codeLink !== undefined,
  )
  @IsString({ message: 'Code link deve ser uma string' })
  @IsUrl({}, { message: 'Code link deve ser uma URL valida' })
  codeLink?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  @Min(0, { message: 'A ordem deve ser maior ou igual a 0' })
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Tags/tecnologias usadas no projeto',
    example: ['React', 'TypeScript', 'Tailwind CSS'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];
}

export class ProjetoResponseDto {
  @ApiProperty({
    description: 'UUID v4 do projeto',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Nome do projeto',
    example: 'Portfolio Pessoal',
  })
  nome: string;

  @ApiProperty({
    description: 'Descricao detalhada do projeto',
    example: 'Um portfolio desenvolvido com React e NestJS.',
  })
  descricao: string;

  @ApiProperty({
    description: 'URL do GIF ou imagem de capa',
    example: 'https://site.com/demo.gif',
  })
  gif: string;

  @ApiProperty({
    description: 'Link para demonstracao online',
    example: 'https://meu-projeto.com',
  })
  demoLink?: string;

  @ApiProperty({
    description: 'Link para o repositorio de codigo',
    example: 'https://github.com/usuario/repo',
  })
  codeLink?: string;

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
