import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class ConfigDto {
  @ApiProperty({
    required: false,
    description: 'UUID v4 da configuracao',
    example: '8f14e45f-ea46-4a37-8f5d-1ba8d5b3dffe',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID deve ser um UUID v4 valido' })
  id?: string;

  @ApiProperty({
    description: 'UUID v4 do profile ao qual a configuracao pertence',
    example: 'd77f54f9-0041-4c4b-b6c1-8ea2d9a67861',
  })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  profileId: string;

  @ApiProperty({
    description: 'Quantidade de stacks usadas pelo profile',
    example: 5,
    minimum: 1,
  })
  @IsInt({ message: 'Stacks deve ser um numero inteiro' })
  @IsPositive({ message: 'Stacks deve ser um numero positivo' })
  @IsNotEmpty({ message: 'Stacks e obrigatorio' })
  stacks: number;

  @ApiProperty({
    description: 'Quantidade de projetos do profile',
    example: 12,
    minimum: 1,
  })
  @IsInt({ message: 'Projetos deve ser um numero inteiro' })
  @IsPositive({ message: 'Projetos deve ser um numero positivo' })
  @IsNotEmpty({ message: 'Projetos e obrigatorio' })
  projetos: number;

  @ApiProperty({
    required: false,
    description: 'Data de criacao do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  @IsOptional()
  createdAt?: Date;
}
