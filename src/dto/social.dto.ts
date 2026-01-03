import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export enum Plataforma {
  instagram = 'instagram',
  tiktok = 'tiktok',
  youtube = 'youtube',
  github = 'github',
  linkedin = 'linkedin',
  twitter = 'twitter',
}

export class SocialDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 do registro social',
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
    description: 'Plataforma da rede social',
    enum: Plataforma,
    example: 'instagram',
  })
  @IsEnum(Plataforma, { message: 'Plataforma invalida' })
  @IsNotEmpty({ message: 'Plataforma e obrigatoria' })
  plataforma: Plataforma;

  @ApiProperty({
    description: 'URL do perfil na rede social',
    example: 'https://instagram.com/usuario',
  })
  @IsString({ message: 'URL deve ser uma string' })
  @IsNotEmpty({ message: 'URL e obrigatoria' })
  @IsUrl({}, { message: 'URL deve ser valida' })
  url: string;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
    default: 0,
  })
  @IsInt({ message: 'Ordem deve ser um numero inteiro' })
  @IsOptional()
  ordem?: number;
}
