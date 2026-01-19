import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjetoDto,
  UpdateProjetoDto,
  ProjetoResponseDto,
} from 'src/dto/projects.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({
    summary: 'Criar projeto',
    description: 'Cria um novo projeto vinculado a um perfil',
  })
  @ApiBody({ type: CreateProjetoDto })
  @ApiCreatedResponse({
    description: 'Projeto criado com sucesso',
    type: ProjetoResponseDto,
  })
  @Post()
  async create(@Body() data: CreateProjetoDto) {
    return this.projectsService.CreateProject(data);
  }

  @ApiOperation({
    summary: 'Listar todos os projetos',
    description:
      'Retorna uma lista de todos os projetos cadastrados, com filtro opcional por profileId',
  })
  @ApiOkResponse({
    description: 'Projetos listados com sucesso',
    type: [ProjetoResponseDto],
  })
  @Get()
  async findAll(@Query('profileId') profileId?: string) {
    return this.projectsService.GetAllProjects(profileId);
  }

  @ApiOperation({
    summary: 'Listar projetos por profileId',
    description: 'Retorna uma lista de projetos filtrados pelo profileId',
  })
  @ApiParam({
    name: 'profileId',
    description: 'UUID do perfil',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Projetos listados com sucesso',
    type: [ProjetoResponseDto],
  })
  @Get('profile/:profileId')
  async findByProfileId(@Param('profileId') profileId: string) {
    return this.projectsService.GetAllProjects(profileId);
  }

  @ApiOperation({
    summary: 'Atualizar projeto',
    description: 'Atualiza os dados de um projeto existente',
  })
  @ApiParam({ name: 'id', description: 'UUID do projeto', type: 'string' })
  @ApiBody({ type: UpdateProjetoDto })
  @ApiOkResponse({
    description: 'Projeto atualizado com sucesso',
    type: ProjetoResponseDto,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateProjetoDto) {
    return this.projectsService.UpdateProject(id, data);
  }

  @ApiOperation({
    summary: 'Deletar projeto',
    description: 'Deleta um projeto existente',
  })
  @ApiParam({ name: 'id', description: 'UUID do projeto', type: 'string' })
  @ApiOkResponse({
    description: 'Projeto deletado com sucesso',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.DeleteProject(id);
  }
}
