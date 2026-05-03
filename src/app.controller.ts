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
    summary: 'Verifica o status da API',
    description: 'Retorna um objeto informando que a API está online',
  })
  @ApiOkResponse({ description: 'API online' })
  @Get('status')
  getStatus() {
    return { status: 'online', timestamp: new Date().toISOString() };
  }
}
