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
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LegendaDto, UpdateLegendaDto } from 'src/dto/legenda.dto';
import { LegendaService } from './legenda.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('legenda')
@UseGuards(JwtAuthGuard)
@Controller('legenda')
export class LegendaController {
  constructor(private readonly legendaService: LegendaService) {}

  @ApiOperation({
    summary: 'Criar legenda',
    description:
      'Cria dados de legenda com informacoes de perfil, titulos e descricao',
  })
  @ApiBody({ type: LegendaDto })
  @ApiCreatedResponse({ description: 'Legenda criada com sucesso' })
  @Post()
  async create(@Request() req: any, @Body() data: LegendaDto) {
    return this.legendaService.create(req.user.userId, data);
  }

  @ApiOperation({
    summary: 'Atualizar legenda',
    description: 'Atualiza dados de legenda existentes',
  })
  @ApiBody({ type: UpdateLegendaDto })
  @ApiCreatedResponse({ description: 'Legenda atualizada com sucesso' })
  @Patch(':id')
  async updateLegenda(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() data: UpdateLegendaDto,
  ) {
    return this.legendaService.updateLegenda(req.user.userId, id, data);
  }

  @ApiOperation({
    summary: 'Obter legenda por profileId',
    description:
      'Obtém os dados de legenda associados a um profileId específico',
  })
  @ApiCreatedResponse({ description: 'Legenda obtida com sucesso' })
  @Post('by-profile/:profileId')
  async getLegendaByProfileId(
    @Request() req: any,
    @Param('profileId') profileId: string,
  ) {
    return this.legendaService.getLegendaByProfileId(req.user.userId, profileId);
  }
}
