import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import {
  CreateLinkButtonDto,
  LinkButtonResponseDto,
  UpdateLinkButtonDto,
} from 'src/dto/link-button.dto';
import { LinkButtonService } from './link-button.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('link-buttons')
@UseGuards(JwtAuthGuard)
@Controller('link-buttons')
export class LinkButtonController {
  constructor(private readonly linkButtonService: LinkButtonService) {}

  @ApiOperation({
    summary: 'Criar link button',
    description: 'Cria um novo botão de link para o perfil de influenciador',
  })
  @ApiBody({ type: CreateLinkButtonDto })
  @ApiCreatedResponse({
    description: 'Link button criado com sucesso',
    type: LinkButtonResponseDto,
  })
  @Post()
  async create(@Request() req: any, @Body() data: CreateLinkButtonDto) {
    return this.linkButtonService.create(req.user.userId, data);
  }

  @ApiOperation({
    summary: 'Listar todos os link buttons',
    description: 'Retorna todos os link buttons',
  })
  @ApiOkResponse({
    description: 'Lista de link buttons',
    type: [LinkButtonResponseDto],
  })
  @Get()
  async findAll(@Request() req: any) {
    return this.linkButtonService.findAll(req.user.userId);
  }

  @ApiOperation({
    summary: 'Buscar link buttons por profileId',
    description: 'Retorna todos os link buttons de um perfil específico',
  })
  @ApiParam({ name: 'profileId', description: 'UUID do perfil' })
  @ApiOkResponse({
    description: 'Lista de link buttons do perfil',
    type: [LinkButtonResponseDto],
  })
  @Get('profile/:profileId')
  async findByProfileId(
    @Request() req: any,
    @Param('profileId', new ParseUUIDPipe({ version: '4' })) profileId: string,
  ) {
    return this.linkButtonService.findByProfileId(req.user.userId, profileId);
  }

  @ApiOperation({
    summary: 'Buscar link button por ID',
    description: 'Retorna um link button específico',
  })
  @ApiParam({ name: 'id', description: 'UUID do link button' })
  @ApiOkResponse({
    description: 'Link button encontrado',
    type: LinkButtonResponseDto,
  })
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.linkButtonService.findOne(req.user.userId, id);
  }

  @ApiOperation({
    summary: 'Atualizar link button',
    description: 'Atualiza um link button existente',
  })
  @ApiParam({ name: 'id', description: 'UUID do link button' })
  @ApiBody({ type: UpdateLinkButtonDto })
  @ApiOkResponse({
    description: 'Link button atualizado',
    type: LinkButtonResponseDto,
  })
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: UpdateLinkButtonDto,
  ) {
    return this.linkButtonService.update(req.user.userId, id, data);
  }

  @ApiOperation({
    summary: 'Deletar link button',
    description: 'Remove um link button',
  })
  @ApiParam({ name: 'id', description: 'UUID do link button' })
  @ApiOkResponse({ description: 'Link button deletado com sucesso' })
  @Delete(':id')
  async delete(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.linkButtonService.delete(req.user.userId, id);
  }

  @ApiOperation({
    summary: 'Deletar todos os link buttons de um perfil',
    description: 'Remove todos os link buttons de um perfil',
  })
  @ApiParam({ name: 'profileId', description: 'UUID do perfil' })
  @ApiOkResponse({ description: 'Todos os link buttons deletados' })
  @Delete('profile/:profileId')
  async deleteAllByProfileId(
    @Request() req: any,
    @Param('profileId', new ParseUUIDPipe({ version: '4' })) profileId: string,
  ) {
    return this.linkButtonService.deleteAllByProfileId(
      req.user.userId,
      profileId,
    );
  }

  @ApiOperation({
    summary: 'Salvar todos os link buttons de um perfil',
    description:
      'Substitui todos os link buttons existentes pelos novos (upsert em lote)',
  })
  @ApiParam({ name: 'profileId', description: 'UUID do perfil' })
  @ApiBody({ type: [CreateLinkButtonDto] })
  @ApiOkResponse({
    description: 'Link buttons salvos com sucesso',
    type: [LinkButtonResponseDto],
  })
  @Put('profile/:profileId')
  async upsertMany(
    @Request() req: any,
    @Param('profileId', new ParseUUIDPipe({ version: '4' })) profileId: string,
    @Body() buttons: Omit<CreateLinkButtonDto, 'profileId'>[],
  ) {
    const buttonsWithProfileId = buttons.map((b) => ({
      ...b,
      profileId,
    }));
    return this.linkButtonService.upsertMany(
      req.user.userId,
      profileId,
      buttonsWithProfileId,
    );
  }
}
