import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SocialService } from './social.service';
import {
  CreateSocialDto,
  UpdateSocialDto,
  SocialResponseDto,
} from '../dto/social.dto';

@ApiTags('social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar rede social',
    description:
      'Cria um novo link de rede social para um perfil. Cada combinação de perfil e plataforma deve ser única.',
  })
  @ApiBody({
    type: CreateSocialDto,
    examples: {
      instagram: {
        summary: 'Link do Instagram',
        value: {
          profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
          plataforma: 'instagram',
          url: 'https://instagram.com/usuario',
          ordem: 1,
        },
      },
      github: {
        summary: 'Link do GitHub',
        value: {
          profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
          plataforma: 'github',
          url: 'https://github.com/usuario',
          ordem: 2,
        },
      },
      linkedin: {
        summary: 'Link do LinkedIn',
        value: {
          profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
          plataforma: 'linkedin',
          url: 'https://linkedin.com/in/usuario',
          ordem: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Rede social criada com sucesso',
    type: SocialResponseDto,
    schema: {
      example: {
        id: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
        profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
        plataforma: 'instagram',
        url: 'https://instagram.com/usuario',
        ordem: 1,
        createdAt: '2025-12-11T22:00:00.000Z',
        updatedAt: '2025-12-11T22:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Já existe um link desta plataforma para este perfil',
  })
  async create(@Body() dto: CreateSocialDto) {
    return this.socialService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as redes sociais',
    description: 'Retorna uma lista de todas as redes sociais cadastradas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de redes sociais',
    schema: {
      example: [
        {
          id: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
          profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
        },
        {
          id: 'a1b2c3d4-5678-4abc-8def-1234567890ab',
          profileId: '2b6f7ad4-ef1b-4527-b8e1-5893d0ac8b3b',
        },
      ],
    },
  })
  async findAll() {
    return this.socialService.findAll();
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Buscar redes sociais por perfil',
    description: 'Retorna todas as redes sociais de um perfil específico',
  })
  @ApiParam({
    name: 'profileId',
    description: 'UUID do perfil',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @ApiResponse({
    status: 200,
    description: 'Redes sociais encontradas',
    type: [SocialResponseDto],
    schema: {
      example: [
        {
          id: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
          profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
          plataforma: 'instagram',
          url: 'https://instagram.com/usuario',
          ordem: 1,
          createdAt: '2025-12-11T22:00:00.000Z',
          updatedAt: '2025-12-11T22:00:00.000Z',
        },
        {
          id: 'a1b2c3d4-5678-4abc-8def-1234567890ab',
          profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
          plataforma: 'github',
          url: 'https://github.com/usuario',
          ordem: 2,
          createdAt: '2025-12-11T22:00:00.000Z',
          updatedAt: '2025-12-11T22:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async findByProfile(@Param('profileId') profileId: string) {
    return this.socialService.findByProfile(profileId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar rede social por ID',
    description: 'Retorna uma rede social específica pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da rede social',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 200,
    description: 'Rede social encontrada',
    type: SocialResponseDto,
    schema: {
      example: {
        id: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
        profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
        plataforma: 'instagram',
        url: 'https://instagram.com/usuario',
        ordem: 1,
        createdAt: '2025-12-11T22:00:00.000Z',
        updatedAt: '2025-12-11T22:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.socialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar rede social',
    description: 'Atualiza informações de uma rede social',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da rede social',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiBody({
    type: UpdateSocialDto,
    examples: {
      atualizarUrl: {
        summary: 'Atualizar URL',
        value: {
          url: 'https://instagram.com/novo-usuario',
        },
      },
      atualizarPlataforma: {
        summary: 'Atualizar plataforma e URL',
        value: {
          plataforma: 'twitter',
          url: 'https://twitter.com/usuario',
        },
      },
      atualizarOrdem: {
        summary: 'Atualizar ordem de exibição',
        value: {
          ordem: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rede social atualizada',
    type: SocialResponseDto,
    schema: {
      example: {
        id: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
        profileId: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
        plataforma: 'twitter',
        url: 'https://twitter.com/usuario',
        ordem: 5,
        createdAt: '2025-12-11T22:00:00.000Z',
        updatedAt: '2025-12-11T22:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateSocialDto) {
    return this.socialService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover rede social',
    description: 'Remove uma rede social do perfil',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da rede social',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 200,
    description: 'Rede social removida',
    schema: {
      example: {
        message: 'Rede social removida com sucesso',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rede social não encontrada' })
  async delete(@Param('id') id: string) {
    return this.socialService.delete(id);
  }
}
