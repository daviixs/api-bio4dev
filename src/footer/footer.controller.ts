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
import { FooterService } from './footer.service';
import {
  CreateFooterDto,
  UpdateFooterDto,
  FooterResponseDto,
} from 'src/dto/footer.dto';

@ApiTags('Footer')
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
  async create(@Body() data: CreateFooterDto) {
    return this.footerService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os footers' })
  @ApiResponse({
    status: 200,
    description: 'Lista de footers retornada com sucesso',
    type: [FooterResponseDto],
  })
  async findAll() {
    return this.footerService.findAll();
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
  async findByProfile(@Param('profileId') profileId: string) {
    return this.footerService.findByProfile(profileId);
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
  async findOne(@Param('id') id: string) {
    return this.footerService.findOne(id);
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
  async update(@Param('id') id: string, @Body() data: UpdateFooterDto) {
    return this.footerService.update(id, data);
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
    @Param('profileId') profileId: string,
    @Body() data: UpdateFooterDto,
  ) {
    return this.footerService.updateByProfile(profileId, data);
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
  async delete(@Param('id') id: string) {
    await this.footerService.delete(id);
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
  async deleteByProfile(@Param('profileId') profileId: string) {
    await this.footerService.deleteByProfile(profileId);
  }
}
