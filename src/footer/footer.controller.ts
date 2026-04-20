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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FooterService } from './footer.service';
import {
  CreateFooterDto,
  UpdateFooterDto,
  FooterResponseDto,
} from 'src/dto/footer.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Footer')
@UseGuards(JwtAuthGuard)
@Controller('footer')
export class FooterController {
  constructor(private readonly footerService: FooterService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo footer' })
  @ApiResponse({
    status: 201,
    description: 'Footer criado com sucesso',
    type: FooterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Footer já existe para este profile',
  })
  async create(@Request() req: any, @Body() data: CreateFooterDto) {
    return this.footerService.create(req.user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os footers' })
  @ApiResponse({
    status: 200,
    description: 'Lista de footers retornada com sucesso',
    type: [FooterResponseDto],
  })
  async findAll(@Request() req: any) {
    return this.footerService.findAll(req.user.userId);
  }

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Buscar footer por profile' })
  @ApiParam({
    name: 'profileId',
    description: 'UUID do profile',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @ApiResponse({
    status: 200,
    description: 'Footer encontrado',
    type: FooterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Footer não encontrado' })
  async findByProfile(@Request() req: any, @Param('profileId') profileId: string) {
    return this.footerService.findByProfile(req.user.userId, profileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar footer por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID do footer',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 200,
    description: 'Footer encontrado',
    type: FooterResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Footer não encontrado' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.footerService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar footer por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID do footer',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 200,
    description: 'Footer atualizado com sucesso',
    type: FooterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Footer não encontrado' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateFooterDto,
  ) {
    return this.footerService.update(req.user.userId, id, data);
  }

  @Put('profile/:profileId')
  @ApiOperation({ summary: 'Atualizar footer por profile' })
  @ApiParam({
    name: 'profileId',
    description: 'UUID do profile',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @ApiResponse({
    status: 200,
    description: 'Footer atualizado com sucesso',
    type: FooterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Footer não encontrado' })
  async updateByProfile(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body() data: UpdateFooterDto,
  ) {
    return this.footerService.updateByProfile(req.user.userId, profileId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar footer por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID do footer',
    example: 'fe5a4c1c-0fbe-4e4f-9b0c-861ebc08f6b6',
  })
  @ApiResponse({
    status: 204,
    description: 'Footer deletado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Footer não encontrado' })
  async delete(@Request() req: any, @Param('id') id: string) {
    await this.footerService.delete(req.user.userId, id);
  }

  @Delete('profile/:profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar footer por profile' })
  @ApiParam({
    name: 'profileId',
    description: 'UUID do profile',
    example: 'e2af5ea1-9938-4a4a-96d9-45d2a8c2d83b',
  })
  @ApiResponse({
    status: 204,
    description: 'Footer deletado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Footer não encontrado' })
  async deleteByProfile(
    @Request() req: any,
    @Param('profileId') profileId: string,
  ) {
    await this.footerService.deleteByProfile(req.user.userId, profileId);
  }
}
