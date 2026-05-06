import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { IsOptional, IsString } from 'class-validator';
import { RefreshTokenService } from './refresh-token.service';
import {
  getRefreshCookieClearOptions,
  getRefreshCookieSetOptions,
} from '../refresh-cookie-options';

class RefreshDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractRefreshToken(dto.refreshToken, req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente');
    }

    const refreshedSession =
      await this.refreshTokenService.refreshAccessToken(refreshToken);

    this.setRefreshCookie(res, refreshedSession.refreshToken);

    return {
      accessToken: refreshedSession.accessToken,
      user: refreshedSession.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.extractRefreshToken(undefined, req);

    if (refreshToken) {
      const decoded = await this.refreshTokenService
        .verifyRefreshTokenOnly(refreshToken)
        .catch(() => null);

      if (decoded?.sub) {
        await this.refreshTokenService.revokeAllUserTokens(decoded.sub);
      }
    }

    res.clearCookie('refresh_token', getRefreshCookieClearOptions());

    return { success: true };
  }

  private extractRefreshToken(tokenFromBody: string | undefined, req: Request) {
    if (tokenFromBody) return tokenFromBody;

    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...rest] = c.trim().split('=');
        return [k, decodeURIComponent(rest.join('='))];
      }),
    );

    return cookies['refresh_token'] || null;
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, getRefreshCookieSetOptions());
  }
}
