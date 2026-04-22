import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  FinalizeDeveloperOnboardingDto,
  FinalizeDeveloperOnboardingResponseDto,
} from '../dto/developer-onboarding.dto';
import { DeveloperOnboardingService } from './developer-onboarding.service';

@ApiTags('developer-onboarding')
@Controller('developer-onboarding')
export class DeveloperOnboardingController {
  constructor(
    private readonly developerOnboardingService: DeveloperOnboardingService,
  ) {}

  @Post('finalize')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Finaliza onboarding draft-first de portfolio dev',
  })
  @ApiResponse({
    status: 201,
    description: 'Portfolio dev finalizado com sucesso',
    type: FinalizeDeveloperOnboardingResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não autenticado',
  })
  async finalize(
    @Req() req: Request & { user?: { id?: string; userId?: string } },
    @Body() dto: FinalizeDeveloperOnboardingDto,
  ) {
    const authenticatedUserId = req.user?.id || req.user?.userId;
    if (!authenticatedUserId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return this.developerOnboardingService.finalize(authenticatedUserId, dto);
  }
}
