import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class FooterDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 do footer',
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
    description: 'Titulo do rodapé',
    example: 'Contato',
  })
  @IsString({ message: 'Title deve ser uma string' })
  @IsNotEmpty({ message: 'Title e obrigatorio' })
  title: string;

  @ApiProperty({
    description: 'Subtitulo do rodapé',
    example: 'Entre em contato para oportunidades',
  })
  @IsString({ message: 'Subtitle deve ser uma string' })
  @IsNotEmpty({ message: 'Subtitle e obrigatorio' })
  subtitle: string;

  @ApiProperty({
    description: 'Email de contato',
    example: 'contato@exemplo.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email invalido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Link do GitHub',
    example: 'https://github.com/usuario',
    required: false,
  })
  @IsUrl({}, { message: 'Github deve ser uma URL valida' })
  @IsOptional()
  github?: string;

  @ApiProperty({
    description: 'Link do LinkedIn',
    example: 'https://linkedin.com/in/usuario',
    required: false,
  })
  @IsUrl({}, { message: 'Linkedin deve ser uma URL valida' })
  @IsOptional()
  linkedin?: string;

  @ApiProperty({
    description: 'Link do Twitter/X',
    example: 'https://twitter.com/usuario',
    required: false,
  })
  @IsUrl({}, { message: 'Twitter deve ser uma URL valida' })
  @IsOptional()
  twitter?: string;

  @ApiProperty({
    description: 'Nome para copyright',
    example: 'Meu Nome',
  })
  @IsString({ message: 'CopyrightName deve ser uma string' })
  @IsNotEmpty({ message: 'CopyrightName e obrigatorio' })
  copyrightName: string;
}
