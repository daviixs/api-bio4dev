import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GoogleOAuthService } from './google-oauth.service';
import {
  AuthTokensResponseDto,
  OAuthCallbackQueryDto,
} from './dto/google-oauth.dto';

const GOOGLE_OAUTH_STATE_COOKIE = 'bio4dev_google_oauth_state';
const googleOauthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 10 * 60 * 1000,
  path: '/auth',
};

function getCookieValue(rawCookieHeader: string | undefined, name: string) {
  if (!rawCookieHeader) {
    return undefined;
  }

  const cookies = rawCookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
}

@ApiTags('auth')
@Controller('auth')
export class GoogleOAuthController {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  /**
   * Initiate Google OAuth flow
   * Returns the Google authorization URL for the frontend to redirect to
   */
  @Get('google')
  @ApiOperation({ summary: 'Get Google OAuth authorization URL' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Google OAuth authorization URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Google OAuth authorization URL' },
        state: { type: 'string', description: 'CSRF state token' },
      },
    },
  })
  getGoogleAuthUrl(
    @Res({ passthrough: true }) res: Response,
  ): { url: string; state: string } {
    const result = this.googleOAuthService.getGoogleAuthUrl();
    res.cookie(GOOGLE_OAUTH_STATE_COOKIE, result.state, googleOauthCookieOptions);
    return result;
  }

  /**
   * Handle Google OAuth callback
   * Exchanges the authorization code for tokens and returns JWT tokens
   */
  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code from Google',
  })
  @ApiQuery({ name: 'state', required: false, description: 'CSRF state token' })
  @ApiQuery({
    name: 'error',
    required: false,
    description: 'Error from Google OAuth',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT tokens and user info',
    type: AuthTokensResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'OAuth authentication failed',
  })
  async handleGoogleCallback(
    @Query() query: OAuthCallbackQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponseDto & { isNew: boolean }> {
    const { code, error, state } = query;

    // Handle OAuth errors from Google
    if (error) {
      res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, googleOauthCookieOptions);
      throw new UnauthorizedException(`Google OAuth error: ${error}`);
    }

    if (!code) {
      res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, googleOauthCookieOptions);
      throw new BadRequestException('Authorization code is required');
    }

    const expectedState = getCookieValue(
      req.headers.cookie,
      GOOGLE_OAUTH_STATE_COOKIE,
    );
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, googleOauthCookieOptions);

    if (!state || !expectedState || state !== expectedState) {
      throw new UnauthorizedException('Invalid OAuth state');
    }

    try {
      // Process the OAuth callback
      const result = await this.googleOAuthService.handleOAuthCallback(code);

      // Set refresh token as HttpOnly cookie
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/auth',
      });

      // Return response without the refresh token (it's in the cookie)
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // mobile clients may use it
        user: result.user,
        isNew: result.isNew,
      };
    } catch (err) {
      console.error('OAuth callback error:', err);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  /**
   * Logout endpoint - clears the refresh token cookie
   */
  @Post('logout')
  @ApiOperation({ summary: 'Logout user and clear tokens' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Clear the refresh token cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    });

    return { message: 'Successfully logged out' };
  }
}
