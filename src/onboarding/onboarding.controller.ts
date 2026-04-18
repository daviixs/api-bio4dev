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
  FinalizeOnboardingDto,
  FinalizeOnboardingResponseDto,
} from '../dto/onboarding.dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('finalize')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Finaliza onboarding e persiste profile autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Onboarding finalizado com sucesso',
    type: FinalizeOnboardingResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não autenticado',
  })
  async finalize(
    @Req() req: Request & { user?: { id?: string; userId?: string } },
    @Body() dto: FinalizeOnboardingDto,
  ) {
    const authenticatedUserId = req.user?.id || req.user?.userId;
    if (!authenticatedUserId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return this.onboardingService.finalize(authenticatedUserId, dto);
  }
}
