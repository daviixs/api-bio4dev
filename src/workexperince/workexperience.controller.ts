import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WorkexperienceService } from './workexperience.service';
import {
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto,
  WorkExperienceResponseDto,
} from 'src/dto/work-experience.dto';

@ApiTags('Work Experience')
@Controller('workexperience')
export class WorkexperinceController {
  constructor(private readonly workexperienceService: WorkexperienceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova experiência de trabalho' })
  @ApiResponse({
    status: 201,
    description: 'Experiência criada com sucesso',
    type: WorkExperienceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Profile não encontrado' })
  async create(@Body() data: CreateWorkExperienceDto) {
    return this.workexperienceService.createWorkExperience(data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as experiências de trabalho' })
  @ApiResponse({
    status: 200,
    description: 'Lista de experiências retornada com sucesso',
    type: [WorkExperienceResponseDto],
  })
  async findAll() {
    return this.workexperienceService.findAll();
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Buscar experiências de trabalho por profile',
  })
  @ApiParam({
    name: 'profileId',
    description: 'UUID do profile',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de experiências do profile',
    type: [WorkExperienceResponseDto],
  })
  async findByProfile(@Param('profileId') profileId: string) {
    return this.workexperienceService.findByProfile(profileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma experiência de trabalho por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID da experiência',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 200,
    description: 'Experiência encontrada',
    type: WorkExperienceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Experiência não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.workexperienceService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma experiência de trabalho' })
  @ApiParam({
    name: 'id',
    description: 'UUID da experiência',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 200,
    description: 'Experiência atualizada com sucesso',
    type: WorkExperienceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Experiência não encontrada' })
  async update(@Param('id') id: string, @Body() data: UpdateWorkExperienceDto) {
    return this.workexperienceService.updateWorkExperience(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar uma experiência de trabalho' })
  @ApiParam({
    name: 'id',
    description: 'UUID da experiência',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 204,
    description: 'Experiência deletada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Experiência não encontrada' })
  async delete(@Param('id') id: string) {
    await this.workexperienceService.deleteWorkExperience(id);
  }
}
