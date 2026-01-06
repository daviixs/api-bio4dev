import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TechstackService } from './techstack.service';
import {
  CreateTechStackDto,
  UpdateTechStackDto,
  TechStackResponseDto,
} from 'src/dto/tech-stack.dto';

@ApiTags('TechStack')
@Controller('techstack')
export class TechstackController {
  constructor(private readonly techstackService: TechstackService) {}

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Buscar TechStack por profileId' })
  @ApiParam({ name: 'profileId', description: 'UUID do Profile' })
  @ApiResponse({
    status: 200,
    description: 'TechStack encontrada',
    type: TechStackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'TechStack não encontrada' })
  async getTechStackByProfile(@Param('profileId') profileId: string) {
    return this.techstackService.getTechStackByProfile(profileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar TechStack por ID' })
  @ApiParam({ name: 'id', description: 'UUID da TechStack' })
  @ApiResponse({
    status: 200,
    description: 'TechStack encontrada',
    type: TechStackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'TechStack não encontrada' })
  async getTechStackById(@Param('id') id: string) {
    return this.techstackService.getTechStackById(id);
  }

  @Post('profile/:profileId')
  @ApiOperation({ summary: 'Criar TechStack para um profile' })
  @ApiParam({ name: 'profileId', description: 'UUID do Profile' })
  @ApiResponse({
    status: 201,
    description: 'TechStack criada com sucesso',
    type: TechStackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'TechStack já existe para este profile',
  })
  async create(
    @Param('profileId') profileId: string,
    @Body() createDto: CreateTechStackDto,
  ) {
    return this.techstackService.create(profileId, createDto);
  }

  @Put('profile/:profileId')
  @ApiOperation({ summary: 'Atualizar TechStack por profileId' })
  @ApiParam({ name: 'profileId', description: 'UUID do Profile' })
  @ApiResponse({
    status: 200,
    description: 'TechStack atualizada com sucesso',
    type: TechStackResponseDto,
  })
  @ApiResponse({ status: 404, description: 'TechStack não encontrada' })
  async update(
    @Param('profileId') profileId: string,
    @Body() updateDto: UpdateTechStackDto,
  ) {
    return this.techstackService.update(profileId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar TechStack por ID' })
  @ApiParam({ name: 'id', description: 'UUID da TechStack' })
  @ApiResponse({ status: 204, description: 'TechStack deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'TechStack não encontrada' })
  async deleteTechStackById(@Param('id') id: string) {
    await this.techstackService.deleteTechStackById(id);
  }

  @Delete('profile/:profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar TechStack por profileId' })
  @ApiParam({ name: 'profileId', description: 'UUID do Profile' })
  @ApiResponse({ status: 204, description: 'TechStack deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'TechStack não encontrada' })
  async deleteTechStackByProfile(@Param('profileId') profileId: string) {
    await this.techstackService.deleteTechStackByProfile(profileId);
  }
}
