import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  DuplicateProfileDto,
  SetActiveProfileDto,
} from 'src/dto/profiles.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ summary: 'Listar todos os perfis' })
  @ApiResponse({ status: 200, description: 'Lista de perfis retornada' })
  @Get()
  async findAll() {
    return this.profileService.findAll();
  }

  @ApiOperation({ summary: 'Criar novo perfil' })
  @ApiResponse({ status: 201, description: 'Perfil criado com sucesso' })
  @Post()
  async create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  // ===== ROTAS ESPECÍFICAS PRIMEIRO (antes de :id) =====

  @ApiOperation({
    summary: 'Lista todos os portfolios de um usuário (máximo 3)',
  })
  @ApiResponse({ status: 200, description: 'Lista de portfolios retornada' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @Get('user/:userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.profileService.findByUserId(userId);
  }

  @ApiOperation({ summary: 'Busca portfolio por slug (público)' })
  @ApiResponse({ status: 200, description: 'Portfolio encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Token de preview inválido ou expirado',
  })
  @ApiResponse({ status: 403, description: 'Portfolio não publicado' })
  @ApiResponse({ status: 404, description: 'Portfolio não encontrado' })
  @ApiParam({ name: 'slug', description: 'Slug do portfolio' })
  @ApiQuery({
    name: 'preview',
    required: false,
    description: 'Token de preview temporário',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @Get('slug/:slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query('preview') previewToken?: string,
  ) {
    return this.profileService.findBySlug(slug, previewToken);
  }

  @ApiOperation({ summary: 'Buscar perfil completo por username' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Token de preview inválido ou expirado',
  })
  @ApiResponse({ status: 403, description: 'Perfil não publicado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiParam({ name: 'username', description: 'Username do perfil' })
  @ApiQuery({
    name: 'preview',
    required: false,
    description: 'Token de preview temporário',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
    @Query('preview') previewToken?: string,
  ) {
    return this.profileService.findByUsername(username, previewToken);
  }

  // ===== ROTAS COM :id/... ANTES DA ROTA GENÉRICA :id =====

  @ApiOperation({ summary: 'Gerar token temporário de preview (24h)' })
  @ApiResponse({
    status: 201,
    description: 'Token gerado com sucesso',
    schema: {
      example: {
        token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        expiresAt: '2026-01-09T23:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @Post(':id/preview-token')
  async generatePreviewToken(@Param('id') id: string) {
    return this.profileService.generatePreviewToken(id);
  }

  @ApiOperation({
    summary: 'Buscar perfil completo por ID (com todos os relacionamentos)',
  })
  @ApiResponse({ status: 200, description: 'Perfil completo retornado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @Get(':id/complete')
  async findComplete(@Param('id') id: string) {
    return this.profileService.findCompleteById(id);
  }

  // ===== ROTA GENÉRICA :id POR ÚLTIMO =====

  @ApiOperation({ summary: 'Buscar perfil por ID' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const profile = await this.profileService.findOne(id);
    if (!profile) {
      throw new NotFoundException(`Perfil com ID "${id}" não encontrado`);
    }
    return profile;
  }

  @ApiOperation({ summary: 'Atualizar perfil' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(id, updateProfileDto);
  }

  @ApiOperation({ summary: 'Deletar perfil e todos os dados relacionados' })
  @ApiResponse({ status: 200, description: 'Perfil deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do perfil' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.profileService.delete(id);
  }

  @ApiOperation({
    summary: 'Define um portfolio como ativo (apenas 1 por usuário)',
  })
  @ApiResponse({ status: 200, description: 'Portfolio ativado com sucesso' })
  @ApiResponse({ status: 403, description: 'Permissão negada' })
  @ApiResponse({ status: 404, description: 'Portfolio não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do portfolio' })
  @ApiBody({ type: SetActiveProfileDto })
  @Patch(':id/set-active')
  async setActive(@Param('id') id: string, @Body() dto: SetActiveProfileDto) {
    return this.profileService.setActiveProfile(id, dto.userId);
  }

  @ApiOperation({ summary: 'Duplica um portfolio existente' })
  @ApiResponse({ status: 201, description: 'Portfolio duplicado com sucesso' })
  @ApiResponse({ status: 400, description: 'Limite de 3 portfolios atingido' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Portfolio não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do portfolio de origem' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'newSlug'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          description: 'ID do usuário',
        },
        newSlug: {
          type: 'string',
          description: 'Novo slug para o portfolio duplicado',
          maxLength: 60,
        },
        copyContent: {
          type: 'boolean',
          description: 'Copiar conteúdo',
          default: true,
        },
        copyMedia: {
          type: 'boolean',
          description: 'Copiar mídias',
          default: false,
        },
      },
    },
  })
  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body() dto: DuplicateProfileDto,
  ) {
    return this.profileService.duplicateProfile(id, userId, dto);
  }

  @ApiOperation({ summary: 'Revoga um token de preview' })
  @ApiResponse({ status: 200, description: 'Token revogado com sucesso' })
  @ApiResponse({ status: 404, description: 'Token não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do portfolio' })
  @ApiParam({ name: 'token', description: 'Token de preview a ser revogado' })
  @Delete(':id/preview-token/:token')
  async revokePreviewToken(
    @Param('id') profileId: string,
    @Param('token') token: string,
  ) {
    return this.profileService.revokePreviewToken(profileId, token);
  }
}
