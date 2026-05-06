import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Healthcheck simples',
    description:
      'Retorna uma mensagem de status para verificar se a API esta online',
  })
  @ApiOkResponse({ description: 'API respondendo com sucesso' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({
    summary: 'Status da API',
    description: 'Retorna o status atual da API e o timestamp da verificacao',
  })
  @ApiOkResponse({ description: 'API online' })
  @Get('status')
  getStatus(): { status: 'online'; timestamp: string } {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
    };
  }
}
