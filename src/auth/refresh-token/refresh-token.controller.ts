import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RefreshTokenService } from './refresh-token.service';

class RefreshDto {
  refreshToken?: string;
}

@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractRefreshToken(dto.refreshToken, req);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenService.refreshAccessToken(refreshToken);

    this.setRefreshCookie(res, newRefreshToken);

    return { accessToken };
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

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    });

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
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });
  }
}
