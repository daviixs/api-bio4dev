import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
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
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsString({ message: 'Nome deve ser uma string' })
  name: string;

  @ApiProperty({
    description: 'Icone da tecnologia (ex: nome do icone em lib de icones)',
    example: 'FaReact',
  })
  @IsNotEmpty({ message: 'Icone e obrigatorio' })
  @IsString({ message: 'Icone deve ser uma string' })
  icon: string;

  @ApiProperty({
    description: 'Cor associada a tecnologia (hex ou classe CSS)',
    example: '#61DAFB',
  })
  @IsNotEmpty({ message: 'Cor e obrigatoria' })
  @IsString({ message: 'Cor deve ser uma string' })
  color: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um inteiro' })
  ordem?: number;
}

export class CreateTechStackDto {
  @ApiPropertyOptional({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsOptional()
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId?: string;

  @ApiProperty({
    description: 'Titulo da secao de tecnologia',
    example: 'Minhas Habilidades',
  })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  @IsString({ message: 'Titulo deve ser uma string' })
  title: string;

  @ApiProperty({
    description: 'Subtitulo da secao',
    example: 'Tecnologias que utilizo no dia a dia',
  })
  @IsNotEmpty({ message: 'Subtitulo e obrigatorio' })
  @IsString({ message: 'Subtitulo deve ser uma string' })
  subtitle: string;

  @ApiPropertyOptional({
    description: 'Lista de tecnologias',
    type: [TechnologyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnologyDto)
  technologies?: TechnologyDto[];
}

export class UpdateTechStackDto {
  @ApiPropertyOptional({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsOptional()
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId?: string;

  @ApiPropertyOptional({
    description: 'Titulo da secao de tecnologia',
    example: 'Minhas Stacks',
  })
  @IsOptional()
  @IsString({ message: 'Titulo deve ser uma string' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Subtitulo da secao',
    example: 'Tecnologias que domino',
  })
  @IsOptional()
  @IsString({ message: 'Subtitulo deve ser uma string' })
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Lista de tecnologias',
    type: [TechnologyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnologyDto)
  technologies?: TechnologyDto[];
}

export class TechStackResponseDto {
  @ApiProperty({
    description: 'UUID v4 da TechStack',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Titulo da secao de tecnologia',
    example: 'Minhas Habilidades',
  })
  title: string;

  @ApiProperty({
    description: 'Subtitulo da secao',
    example: 'Tecnologias que utilizo no dia a dia',
  })
  subtitle: string;

  @ApiProperty({
    description: 'Lista de tecnologias',
    type: [TechnologyDto],
  })
  technologies?: TechnologyDto[];

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
