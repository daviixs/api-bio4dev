import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  Request,
  UseGuards,
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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('projects')
@UseGuards(JwtAuthGuard)
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
  async create(@Request() req: any, @Body() data: CreateProjetoDto) {
    return this.projectsService.CreateProject(req.user.userId, data);
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
  async findAll(@Request() req: any, @Query('profileId') profileId?: string) {
    return this.projectsService.GetAllProjects(req.user.userId, profileId);
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
  async findByProfileId(@Request() req: any, @Param('profileId') profileId: string) {
    return this.projectsService.GetAllProjects(req.user.userId, profileId);
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
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateProjetoDto,
  ) {
    return this.projectsService.UpdateProject(req.user.userId, id, data);
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
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.projectsService.DeleteProject(req.user.userId, id);
  }
}
