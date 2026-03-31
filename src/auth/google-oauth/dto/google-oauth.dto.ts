import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleOAuthCallbackDto {
  @ApiProperty({
    description: 'Authorization code from Google OAuth',
    example: '4/0AY0e-g7...',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'State parameter for CSRF protection',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;
}

export class OAuthCallbackQueryDto {
  @ApiProperty({ description: 'Authorization code from Google' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'CSRF state token' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Error from Google OAuth' })
  @IsOptional()
  @IsString()
  error?: string;
}

export class GoogleProfileDto {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    isNew: boolean;
  };
}
