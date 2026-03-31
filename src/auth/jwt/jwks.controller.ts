import { Controller, Get } from '@nestjs/common';
import { JwksService } from './jwks.service';
import type { JWKSResponse } from './jwks.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('JWKS')
@Controller('.well-known')
export class JwksController {
  constructor(private readonly jwksService: JwksService) {}

  @Get('jwks.json')
  @ApiOperation({ summary: 'Get JSON Web Key Set for token verification' })
  @ApiResponse({
    status: 200,
    description: 'Returns the public keys used for JWT verification',
  })
  getJwks(): JWKSResponse {
    return this.jwksService.getJwks();
  }
}
