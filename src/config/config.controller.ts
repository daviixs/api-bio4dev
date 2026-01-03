import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ConfigDto } from 'src/dto/config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: 'Criar configuracao',
    description:
      'Registra configuracoes numericas do profile (stacks e projetos)',
  })
  @ApiBody({ type: ConfigDto })
  @ApiCreatedResponse({ description: 'Configuracao criada com sucesso' })
  @Post()
  async create(@Body() data: ConfigDto) {
    return this.configService.create(data);
  }

  @ApiOperation({
    summary: 'Atualizar configuracao',
    description: 'Atualiza stacks e projetos de uma configuracao existente',
  })
  @ApiBody({ type: ConfigDto })
  @ApiCreatedResponse({ description: 'Configuracao atualizada com sucesso' })
  @Post(':id')
  async updateConfig(@Param('id') id: string, @Body() data: ConfigDto) {
    return this.configService.updateConfig(id, data);
  }

  @ApiOperation({
    summary: 'Obter configuracao por profileId',
    description: 'Obtém as configurações associadas a um profileId específico',
  })
  @ApiCreatedResponse({ description: 'Configuracao obtida com sucesso' })
  @Post('by-profile/:profileId')
  async getConfigByProfileId(@Param('profileId') profileId: string) {
    return this.configService.getConfigByProfileId(profileId);
  }
}
