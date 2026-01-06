import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class ConfigDto {
  @ApiProperty({
    description: 'UUID v4 do profile ao qual a configuracao pertence',
    example: 'd77f54f9-0041-4c4b-b6c1-8ea2d9a67861',
  })
  @IsNotEmpty({ message: 'profileId e obrigatorio' })
  @IsUUID('4', { message: 'profileId deve ser um UUID v4 valido' })
  profileId: string;

  @ApiProperty({
    description: 'Quantidade de stacks usadas pelo profile',
    example: 5,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Stacks e obrigatorio' })
  @IsInt({ message: 'Stacks deve ser um numero inteiro' })
  @IsPositive({ message: 'Stacks deve ser um numero positivo' })
  stacks: number;

  @ApiProperty({
    description: 'Quantidade de projetos do profile',
    example: 12,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Projetos e obrigatorio' })
  @IsInt({ message: 'Projetos deve ser um numero inteiro' })
  @IsPositive({ message: 'Projetos deve ser um numero positivo' })
  projetos: number;
}

export class UpdateConfigDto {
  @ApiPropertyOptional({
    description: 'Quantidade de stacks usadas pelo profile',
    example: 8,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Stacks deve ser um numero inteiro' })
  @IsPositive({ message: 'Stacks deve ser um numero positivo' })
  stacks?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de projetos do profile',
    example: 15,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Projetos deve ser um numero inteiro' })
  @IsPositive({ message: 'Projetos deve ser um numero positivo' })
  projetos?: number;
}

export class ConfigResponseDto {
  @ApiProperty({
    description: 'UUID v4 da configuracao',
    example: '8f14e45f-ea46-4a37-8f5d-1ba8d5b3dffe',
  })
  id: string;

  @ApiProperty({
    description: 'UUID v4 do profile ao qual a configuracao pertence',
    example: 'd77f54f9-0041-4c4b-b6c1-8ea2d9a67861',
  })
  profileId: string;

  @ApiProperty({
    description: 'Quantidade de stacks usadas pelo profile',
    example: 5,
  })
  stacks: number;

  @ApiProperty({
    description: 'Quantidade de projetos do profile',
    example: 12,
  })
  projetos: number;

  @ApiProperty({
    description: 'Data de criacao do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualizacao do registro',
    example: '2025-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}
