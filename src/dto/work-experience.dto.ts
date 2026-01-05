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

export class WorkTechnologyDto {
  @ApiPropertyOptional({
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
  @IsNotEmpty({ message: 'Technology e obrigatorio' })
  @IsString({ message: 'Technology deve ser uma string' })
  technology: string;
}

export class WorkResponsibilityDto {
  @ApiPropertyOptional({
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
  @IsNotEmpty({ message: 'Responsibility e obrigatorio' })
  @IsString({ message: 'Responsibility deve ser uma string' })
  responsibility: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um inteiro' })
  ordem?: number;
}

export class CreateWorkExperienceDto {
  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tech Solutions',
  })
  @IsNotEmpty({ message: 'Company e obrigatorio' })
  @IsString({ message: 'Company deve ser uma string' })
  company: string;

  @ApiProperty({
    description: 'Periodo de trabalho',
    example: 'Jan 2022 - Atual',
  })
  @IsNotEmpty({ message: 'Period e obrigatorio' })
  @IsString({ message: 'Period deve ser uma string' })
  period: string;

  @ApiProperty({
    description: 'Resumo da experiencia',
    example: 'Atuacao como desenvolvedor backend...',
  })
  @IsNotEmpty({ message: 'Summary e obrigatorio' })
  @IsString({ message: 'Summary deve ser uma string' })
  summary: string;

  @ApiPropertyOptional({
    description: 'Impacto gerado',
    example: 'Aumento de 20% na performance da API',
  })
  @IsOptional()
  @IsString({ message: 'Impact deve ser uma string' })
  impact?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Lista de tecnologias utilizadas',
    type: [WorkTechnologyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkTechnologyDto)
  technologies?: WorkTechnologyDto[];

  @ApiPropertyOptional({
    description: 'Lista de responsabilidades',
    type: [WorkResponsibilityDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkResponsibilityDto)
  responsibilities?: WorkResponsibilityDto[];
}

export class UpdateWorkExperienceDto {
  @ApiPropertyOptional({
    description: 'Nome da empresa',
    example: 'Tech Solutions Inc',
  })
  @IsOptional()
  @IsString({ message: 'Company deve ser uma string' })
  company?: string;

  @ApiPropertyOptional({
    description: 'Periodo de trabalho',
    example: 'Jan 2022 - Dez 2024',
  })
  @IsOptional()
  @IsString({ message: 'Period deve ser uma string' })
  period?: string;

  @ApiPropertyOptional({
    description: 'Resumo da experiencia',
    example: 'Atuacao como desenvolvedor backend senior...',
  })
  @IsOptional()
  @IsString({ message: 'Summary deve ser uma string' })
  summary?: string;

  @ApiPropertyOptional({
    description: 'Impacto gerado',
    example: 'Aumento de 30% na performance da API',
  })
  @IsOptional()
  @IsString({ message: 'Impact deve ser uma string' })
  impact?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Lista de tecnologias utilizadas',
    type: [WorkTechnologyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkTechnologyDto)
  technologies?: WorkTechnologyDto[];

  @ApiPropertyOptional({
    description: 'Lista de responsabilidades',
    type: [WorkResponsibilityDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkResponsibilityDto)
  responsibilities?: WorkResponsibilityDto[];
}

export class WorkExperienceResponseDto {
  @ApiProperty({
    description: 'UUID v4',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile relacionado',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  profileId: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tech Solutions',
  })
  company: string;

  @ApiProperty({
    description: 'Periodo de trabalho',
    example: 'Jan 2022 - Atual',
  })
  period: string;

  @ApiProperty({
    description: 'Resumo da experiencia',
    example: 'Atuacao como desenvolvedor backend...',
  })
  summary: string;

  @ApiProperty({
    description: 'Impacto gerado',
    example: 'Aumento de 20% na performance da API',
  })
  impact?: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
  })
  ordem: number;

  @ApiProperty({
    description: 'Lista de tecnologias utilizadas',
    type: [WorkTechnologyDto],
  })
  technologies?: WorkTechnologyDto[];

  @ApiProperty({
    description: 'Lista de responsabilidades',
    type: [WorkResponsibilityDto],
  })
  responsibilities?: WorkResponsibilityDto[];

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
