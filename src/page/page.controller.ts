import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { PageService } from './page.service';
import { PageDto } from 'src/dto/page.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('pages')
@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @ApiOperation({
    summary: 'Criar pagina',
    description: 'Cria uma pagina vinculada a um profile',
  })
  @ApiBody({ type: PageDto })
  @ApiCreatedResponse({ description: 'Pagina criada com sucesso' })
  @Post()
  async create(@Request() req: any, @Body() data: PageDto) {
    return this.pageService.create(req.user.userId, data);
  }

  @ApiOperation({
    summary: 'Atualizar pagina',
    description: 'Atualiza titulo, slug e ordem de uma pagina existente',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID v4 da pagina',
    type: String,
  })
  @ApiBody({ type: PageDto })
  @ApiOkResponse({ description: 'Pagina atualizada com sucesso' })
  @Patch(':id')
  async updatePage(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: PageDto,
  ) {
    return this.pageService.updatePage(req.user.userId, id, data);
  }

  @ApiOperation({
    summary: 'Obter pagina por ID',
    description: 'Recupera uma pagina existente pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador UUID v4 da pagina',
    type: String,
  })
  @ApiOkResponse({ description: 'Pagina recuperada com sucesso' })
  @Post(':id')
  async getPageById(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.pageService.getPageById(req.user.userId, id);
  }
}
