import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

const templateOptions = ['template_01', 'template_02', 'template_03'] as const;
const colorOptions = ['LIGHT', 'DARK'] as const;

export enum Colors {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export class ProfileDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 do profile',
    example: '6c6f7f19-9d34-4b22-9a64-8d7ec713ef5c',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'UUID v4 do usuario dono do profile',
    example: '2b6f7ad4-ef1b-4527-b8e1-5893d0ac8b3b',
  })
  @IsUUID('4', { message: 'userId deve ser um UUID v4 valido' })
  @IsNotEmpty({ message: 'userId e obrigatorio' })
  userId: string;

  @ApiProperty({
    description: 'Nome de usuario publico',
    example: 'ana.silva',
    maxLength: 40,
  })
  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username e obrigatorio' })
  @MaxLength(40, { message: 'Username deve ter no maximo 40 caracteres' })
  username: string;

  @ApiProperty({
    required: false,
    description: 'Biografia curta do perfil',
    example: 'Desenvolvedora full stack e mentora de carreira.',
  })
  @IsOptional()
  @IsString({ message: 'Bio deve ser uma string' })
  bio?: string;

  @ApiProperty({
    required: false,
    description: 'URL do avatar',
    example: 'https://cdn.site.com/avatar.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL invalida' })
  avatarUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Tema do portfolio (claro ou escuro)',
    enum: colorOptions,
    default: 'LIGHT',
    example: 'DARK',
  })
  @IsOptional()
  @IsEnum(Colors, {
    message: 'Theme deve ser LIGHT ou DARK',
  })
  theme?: Colors;

  @ApiProperty({
    required: false,
    description: 'Cor principal do portfolio em hexadecimal',
    example: '#FF5733',
    maxLength: 7,
  })
  @IsOptional()
  @IsString({ message: 'mainColor deve ser uma string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'mainColor deve ser um hexadecimal valido (ex: #FF5733)',
  })
  mainColor?: string;

  @ApiProperty({
    description: 'Template escolhido para o perfil',
    enum: templateOptions,
  })
  @IsEnum(['template_01', 'template_02', 'template_03'], {
    message: 'Template deve ser template_01, template_02 ou template_03',
  })
  @IsNotEmpty({ message: 'Template e obrigatorio' })
  templateType: (typeof templateOptions)[number];

  @ApiProperty({
    required: false,
    description: 'Se o perfil esta publicado',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Published deve ser um booleano' })
  published?: boolean;
}
