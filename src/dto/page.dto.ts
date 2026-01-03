import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

export class PageDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 da pagina',
    example: '5f7e0c2b-b7c3-4e9f-86b5-8f2b77f3c4a0',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'UUID v4 do profile dono da pagina',
    example: 'a1b2c3d4-5678-4abc-8def-1234567890ab',
  })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  profileId: string;

  @ApiProperty({
    description: 'Titulo da pagina',
    example: 'Projetos em destaque',
    maxLength: 120,
  })
  @IsString({ message: 'Titulo deve ser uma string' })
  @IsNotEmpty({ message: 'Titulo e obrigatorio' })
  @MaxLength(120, { message: 'Titulo deve ter no maximo 120 caracteres' })
  titulo: string;

  @ApiProperty({
    description: 'Slug em letras minusculas e hifens',
    example: 'projetos-em-destaque',
    maxLength: 100,
  })
  @IsString({ message: 'Slug deve ser uma string' })
  @IsNotEmpty({ message: 'Slug e obrigatorio' })
  @MaxLength(100, { message: 'Slug deve ter no maximo 100 caracteres' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug deve conter apenas letras minusculas, numeros e hifens',
  })
  slug: string;

  @ApiProperty({
    required: false,
    description: 'Posicao da pagina no menu ou listagem',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  ordem?: number;

  @ApiProperty({
    required: false,
    description: 'Data de criacao da pagina',
    example: '2025-01-01T12:00:00.000Z',
  })
  @IsOptional()
  createdAt?: Date;
}
