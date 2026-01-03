import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

@ApiTags('pages')
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
  async create(@Body() data: PageDto) {
    return this.pageService.create(data);
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: PageDto,
  ) {
    return this.pageService.updatePage(id, data);
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.pageService.getPageById(id);
  }
}
