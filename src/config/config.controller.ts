import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ConfigDto, UpdateConfigDto } from 'src/dto/config.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('config')
@UseGuards(JwtAuthGuard)
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
  async create(@Request() req: any, @Body() data: ConfigDto) {
    return this.configService.create(req.user.userId, data);
  }

  @ApiOperation({
    summary: 'Atualizar configuracao',
    description: 'Atualiza stacks e projetos de uma configuracao existente',
  })
  @ApiBody({ type: UpdateConfigDto })
  @ApiCreatedResponse({ description: 'Configuracao atualizada com sucesso' })
  @Patch(':id')
  async updateConfig(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateConfigDto,
  ) {
    return this.configService.updateConfig(req.user.userId, id, data);
  }

  @ApiOperation({
    summary: 'Obter configuracao por profileId',
    description: 'Obtém as configurações associadas a um profileId específico',
  })
  @ApiCreatedResponse({ description: 'Configuracao obtida com sucesso' })
  @Post('by-profile/:profileId')
  async getConfigByProfileId(
    @Request() req: any,
    @Param('profileId') profileId: string,
  ) {
    return this.configService.getConfigByProfileId(req.user.userId, profileId);
  }
}
