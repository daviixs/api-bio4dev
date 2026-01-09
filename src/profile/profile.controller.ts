import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto, UpdateProfileDto } from 'src/dto/profiles.dto';

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
}
