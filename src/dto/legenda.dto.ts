import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class LegendaDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 da legenda',
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
    description: 'URL da imagem que sera legendada',
    example: 'https://cdn.site.com/avatar.png',
  })
  @IsString({ message: 'Legenda foto deve ser uma string' })
  @IsNotEmpty({ message: 'Legenda foto e obrigatoria' })
  @IsUrl({}, { message: 'Legenda foto deve ser uma URL valida' })
  legendaFoto: string;

  @ApiProperty({
    description: 'Saudacao inicial (ex: Ola, eu sou)',
    example: 'Ola, eu sou',
    required: false,
    maxLength: 100,
  })
  @IsString({ message: 'Greeting deve ser uma string' })
  @IsOptional()
  greeting?: string;

  @ApiProperty({
    description: 'Nome da pessoa ou perfil',
    example: 'Ana Silva',
    maxLength: 255,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  nome: string;

  @ApiProperty({
    description: 'Titulo principal exibido na pagina',
    example: 'Desenvolvedora Full Stack',
    maxLength: 255,
  })
  @IsString({ message: 'Titulo deve ser uma string' })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  titulo: string;

  @ApiProperty({
    description: 'Subtitulo ou chamada auxiliar',
    example: 'Apaixonada por tecnologia e educacao',
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Subtitulo deve ser uma string' })
  @IsNotEmpty({ message: 'Subtitulo e obrigatorio' })
  subtitulo: string;

  @ApiProperty({
    description: 'Descricao curta do perfil',
    example: 'Mentora de carreira, criadora de conteudo e dev full stack.',
    required: false,
  })
  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  descricao: string;

  @ApiProperty({
    required: false,
    description: 'Data de criacao do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  @IsOptional()
  createdAt?: Date;
}
