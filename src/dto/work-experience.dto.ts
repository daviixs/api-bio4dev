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

export class WorkTechnologyDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'Nome da tecnologia utilizada',
    example: 'NestJS',
  })
  @IsString({ message: 'Technology deve ser uma string' })
  @IsNotEmpty({ message: 'Technology e obrigatorio' })
  technology: string;
}

export class WorkResponsibilityDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'Descricao da responsabilidade',
    example: 'Desenvolvimento de APIs RESTful',
  })
  @IsString({ message: 'Responsibility deve ser uma string' })
  @IsNotEmpty({ message: 'Responsibility e obrigatorio' })
  responsibility: string;

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

export class WorkExperienceDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4',
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
    description: 'Nome da empresa',
    example: 'Tech Solutions',
  })
  @IsString({ message: 'Company deve ser uma string' })
  @IsNotEmpty({ message: 'Company e obrigatorio' })
  company: string;

  @ApiProperty({
    description: 'Periodo de trabalho',
    example: 'Jan 2022 - Atual',
  })
  @IsString({ message: 'Period deve ser uma string' })
  @IsNotEmpty({ message: 'Period e obrigatorio' })
  period: string;

  @ApiProperty({
    description: 'Resumo da experiencia',
    example: 'Atuacao como desenvolvedor backend...',
  })
  @IsString({ message: 'Summary deve ser uma string' })
  @IsNotEmpty({ message: 'Summary e obrigatorio' })
  summary: string;

  @ApiProperty({
    description: 'Impacto gerado (opcional)',
    example: 'Aumento de 20% na performance da API',
    required: false,
  })
  @IsString({ message: 'Impact deve ser uma string' })
  @IsOptional()
  impact?: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
    default: 0,
  })
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  @IsOptional()
  ordem?: number;

  @ApiProperty({
    description: 'Lista de tecnologias utilizadas',
    type: [WorkTechnologyDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkTechnologyDto)
  @IsOptional()
  technologies?: WorkTechnologyDto[];

  @ApiProperty({
    description: 'Lista de responsabilidades',
    type: [WorkResponsibilityDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkResponsibilityDto)
  @IsOptional()
  responsibilities?: WorkResponsibilityDto[];
}
