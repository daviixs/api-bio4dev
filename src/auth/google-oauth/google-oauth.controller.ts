import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GoogleOAuthService } from './google-oauth.service';
import { appendFileSync } from 'fs';

const OAUTH_DEBUG_LOG_PATH = '/tmp/bio4dev-google-oauth-debug.log';

function debugOAuthController(stage: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    appendFileSync(
      OAUTH_DEBUG_LOG_PATH,
      `${JSON.stringify({ at: new Date().toISOString(), stage, ...details })}\n`,
    );
  } catch (error) {
    console.error('Failed to write OAuth controller debug log:', error);
  }
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const maybeApiError = error as Error & {
      code?: string;
      response?: { status?: number; data?: unknown };
    };

    return {
      name: error.name,
      message: error.message,
      code: maybeApiError.code,
      status: maybeApiError.response?.status,
      data: maybeApiError.response?.data,
    };
  }

  return { error };
}

@ApiTags('auth')
@Controller('auth')
export class GoogleOAuthController {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  /**
   * Initiate Google OAuth flow
   * Browser navigates directly here and backend redirects to Google
   */
  @Get('google')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Start Google OAuth flow with backend redirect' })
  @ApiResponse({
    status: 302,
    description: 'Redirects browser to Google OAuth',
  })
  async getGoogleAuthUrl(@Res() res: Response): Promise<void> {
    const result = await this.googleOAuthService.createGoogleAuthRedirect();
    res.redirect(result.url);
  }

  /**
   * Handle Google OAuth callback
   * Completes the session server-side and redirects back to the frontend
   */
  @Get('google/callback')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Authorization code from Google',
  })
  @ApiQuery({ name: 'state', required: false, description: 'CSRF state token' })
  @ApiQuery({
    name: 'error',
    required: false,
    description: 'Error from Google OAuth',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects browser back to frontend callback',
  })
  async handleGoogleCallback(
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    debugOAuthController('controller:callback:start', {
      hasCode: Boolean(code),
      hasError: Boolean(error),
      hasState: Boolean(state),
      codeLength: code?.length ?? 0,
      stateLength: state?.length ?? 0,
      providerError: error,
    });

    if (error) {
      res.redirect(
        this.googleOAuthService.buildFrontendCallbackUrl(
          'error',
          this.googleOAuthService.mapOAuthProviderError(error),
        ),
      );
      return;
    }

    if (!code) {
      res.redirect(
        this.googleOAuthService.buildFrontendCallbackUrl(
          'error',
          'missing_code',
        ),
      );
      return;
    }

    const handoff = this.googleOAuthService.verifyOAuthState(state);
    if (!handoff) {
      debugOAuthController('controller:callback:invalid-state');
      res.redirect(
        this.googleOAuthService.buildFrontendCallbackUrl(
          'error',
          'invalid_state',
        ),
      );
      return;
    }

    try {
      const result = await this.googleOAuthService.handleOAuthCallback(
        code,
        handoff.codeVerifier,
      );

      debugOAuthController('controller:callback:success', {
        userId: result.user.id,
        isNew: result.isNew,
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/auth',
      });

      res.redirect(this.googleOAuthService.buildFrontendCallbackUrl('success'));
    } catch (err) {
      debugOAuthController(
        'controller:callback:error',
        getErrorDetails(err),
      );
      console.error('OAuth callback error:', err);
      res.redirect(
        this.googleOAuthService.buildFrontendCallbackUrl(
          'error',
          'oauth_callback_failed',
        ),
      );
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
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
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
