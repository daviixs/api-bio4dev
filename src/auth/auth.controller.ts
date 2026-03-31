import { Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @deprecated Email/password registration is no longer supported.
   * Use Google OAuth instead via /auth/google
   */
  @ApiOperation({ summary: 'Deprecated - Use Google OAuth at /auth/google' })
  @Post('register')
  public async register(): Promise<never> {
    throw new BadRequestException(
      'Email/password registration is no longer supported. Please use Google Sign-In at /auth/google',
    );
  }

  /**
   * @deprecated Email/password login is no longer supported.
   * Use Google OAuth instead via /auth/google
   */
  @ApiOperation({ summary: 'Deprecated - Use Google OAuth at /auth/google' })
  @Post('login')
  public async login(): Promise<never> {
    throw new BadRequestException(
      'Email/password login is no longer supported. Please use Google Sign-In at /auth/google',
    );
  }
}
