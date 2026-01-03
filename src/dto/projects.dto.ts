import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class ProjetoDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 do projeto',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  profileId: string;

  @ApiProperty({
    description: 'Nome do projeto',
    example: 'Portfolio Pessoal',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  nome: string;

  @ApiProperty({
    description: 'Descricao detalhada do projeto',
    example: 'Um portfolio desenvolvido com React e NestJS.',
  })
  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  descricao: string;

  @ApiProperty({
    description: 'URL do GIF ou imagem de capa',
    example: 'https://site.com/demo.gif',
  })
  @IsString({ message: 'Gif deve ser uma string' })
  @IsNotEmpty({ message: 'Gif e obrigatorio' })
  @IsUrl({}, { message: 'Gif deve ser uma URL valida' })
  gif: string;

  @ApiProperty({
    description: 'Link para demonstracao online',
    example: 'https://meu-projeto.com',
    required: false,
  })
  @IsString({ message: 'Demo link deve ser uma string' })
  @IsOptional()
  @IsUrl({}, { message: 'Demo link deve ser uma URL valida' })
  demoLink?: string;

  @ApiProperty({
    description: 'Link para o repositorio de codigo',
    example: 'https://github.com/usuario/repo',
    required: false,
  })
  @IsString({ message: 'Code link deve ser uma string' })
  @IsOptional()
  @IsUrl({}, { message: 'Code link deve ser uma URL valida' })
  codeLink?: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
    default: 0,
  })
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  @IsOptional()
  @Min(0, { message: 'A ordem deve ser maior ou igual a 0' })
  ordem?: number;
}
