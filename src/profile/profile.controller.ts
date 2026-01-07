import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  ProfileResponseDto,
} from 'src/dto/profiles.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({
    summary: 'Criar profile',
    description: 'Cria um perfil vinculado a um usuario',
  })
  @ApiBody({ type: CreateProfileDto })
  @ApiCreatedResponse({
    description: 'Perfil criado com sucesso',
    type: ProfileResponseDto,
  })
  @Post()
  async create(@Body() data: CreateProfileDto) {
    return this.profileService.create(data);
  }

  @ApiOperation({
    summary: 'Buscar profile por ID',
    description: 'Retorna os dados de um perfil pelo seu ID',
  })
  @ApiParam({ name: 'id', description: 'UUID do profile', type: 'string' })
  @ApiOkResponse({
    description: 'Perfil encontrado com sucesso',
    type: ProfileResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @ApiOperation({
    summary: 'Buscar profile público por username',
    description:
      'Retorna o perfil completo com todos os relacionamentos (legenda, social, config, projetos, techStack, workHistory, footer). Apenas perfis publicados são retornados.',
  })
  @ApiParam({
    name: 'username',
    description: 'Username único do profile',
    type: 'string',
    example: 'joaosilva',
  })
  @ApiOkResponse({
    description: 'Perfil público encontrado com sucesso',
  })
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    return this.profileService.findByUsername(username);
  }

  @ApiOperation({
    summary: 'Atualizar profile',
    description:
      'Atualiza os dados de um perfil existente (incluindo theme e mainColor)',
  })
  @ApiParam({ name: 'id', description: 'UUID do profile', type: 'string' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'Perfil atualizado com sucesso',
    type: ProfileResponseDto,
  })
  @Patch(':id')
  async updateProfile(@Param('id') id: string, @Body() data: UpdateProfileDto) {
    return this.profileService.updateProfile(id, data);
  }
}
