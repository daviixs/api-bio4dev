import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class TechnologyDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 da tecnologia (opcional na criacao)',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'Nome da tecnologia',
    example: 'React',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  name: string;

  @ApiProperty({
    description: 'Icone da tecnologia (ex: nome do icone em lib de icones)',
    example: 'FaReact',
  })
  @IsString({ message: 'Icone deve ser uma string' })
  @IsNotEmpty({ message: 'Icone e obrigatorio' })
  icon: string;

  @ApiProperty({
    description: 'Cor associada a tecnologia (hex ou classe CSS)',
    example: '#61DAFB',
  })
  @IsString({ message: 'Cor deve ser uma string' })
  @IsNotEmpty({ message: 'Cor e obrigatoria' })
  color: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    required: false,
    example: 0,
    default: 0,
  })
  @IsInt({ message: 'Ordem deve ser um inteiro' })
  @IsOptional()
  ordem?: number;
}

export class TechStackDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 da TechStack',
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
    description: 'Titulo da secao de tecnologia',
    example: 'Minhas Habilidades',
  })
  @IsString({ message: 'Titulo deve ser uma string' })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  title: string;

  @ApiProperty({
    description: 'Subtitulo da secao',
    example: 'Tecnologias que utilizo no dia a dia',
  })
  @IsString({ message: 'Subtitulo deve ser uma string' })
  @IsNotEmpty({ message: 'Subtitulo e obrigatorio' })
  subtitle: string;

  @ApiProperty({
    description: 'Lista de tecnologias',
    type: [TechnologyDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnologyDto)
  @IsOptional()
  technologies?: TechnologyDto[];
}
