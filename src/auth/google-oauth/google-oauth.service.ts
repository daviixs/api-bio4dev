import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtCustomService } from '../jwt/jwt-custom.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import {
  GoogleProfileDto,
  AuthTokensResponseDto,
} from './dto/google-oauth.dto';
import { createHmac } from 'crypto';

@Injectable()
export class GoogleOAuthService {
  private oauth2Client: OAuth2Client;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private emailHmacKey: string;
  private bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtCustomService,
  ) {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:5173/auth/callback/google';
    this.emailHmacKey = process.env.EMAIL_HMAC_KEY || '';
    this.bcryptRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

    this.oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        'Google OAuth credentials not configured. Google login will not work.',
      );
    }

    if (!this.emailHmacKey) {
      throw new Error('EMAIL_HMAC_KEY is required to hash emails');
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hmacEmail(email: string): string {
    return createHmac('sha256', this.emailHmacKey)
      .update(email)
      .digest('hex');
  }

  /**
   * Generate the Google OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const scopes = ['openid', 'email', 'profile'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state,
      redirect_uri: this.redirectUri,
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
  ): Promise<{ idToken: string; accessToken: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken({
        code,
        redirect_uri: this.redirectUri,
      });

      if (!tokens.id_token) {
        throw new UnauthorizedException('No ID token received from Google');
      }

      return {
        idToken: tokens.id_token,
        accessToken: tokens.access_token || '',
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  /**
   * Verify Google ID token and extract user profile
   */
  async verifyGoogleIdToken(idToken: string): Promise<GoogleProfileDto> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google ID token');
      }

      return {
        googleId: payload.sub,
        email: payload.email || '',
        name: payload.name || payload.email?.split('@')[0] || 'User',
        picture: payload.picture,
      };
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      throw new UnauthorizedException('Failed to verify Google ID token');
    }
  }

  /**
   * Find existing user by Google ID or create new user
   */
  async findOrCreateUser(
    googleProfile: GoogleProfileDto,
  ): Promise<{ user: any; isNew: boolean }> {
    const { googleId, email, name, picture } = googleProfile;

    const normalizedEmail = this.normalizeEmail(email);
    const emailIndex = this.hmacEmail(normalizedEmail);

    // First, try to find by Google ID
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (user) {
    // Update avatar or email hash if changed
    const updates: Record<string, any> = {};
    if (picture && user.avatar !== picture) {
      updates.avatar = picture;
    }

    if (!user.emailIndex) {
      updates.emailIndex = emailIndex;
    }

    if (!user.emailBcrypt) {
      updates.emailBcrypt = await bcrypt.hash(normalizedEmail, this.bcryptRounds);
    }

    if (!user.emailMasked) {
      updates.emailMasked = this.maskEmail(normalizedEmail);
    }

    if (Object.keys(updates).length > 0) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: updates });
    }

    return { user, isNew: false };
  }

    // Check if email already exists (user registered with different method)
    const existingEmailUser = await this.prisma.user.findUnique({
      where: { emailIndex },
    });

    if (existingEmailUser) {
      // Link Google account to existing user
      user = await this.prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          googleId,
          avatar: picture || existingEmailUser.avatar,
        },
      });
      return { user, isNew: false };
    }

    // Create new user
    const emailBcrypt = await bcrypt.hash(normalizedEmail, this.bcryptRounds);

    user = await this.prisma.user.create({
      data: {
        emailIndex,
        emailBcrypt,
        emailMasked: this.maskEmail(normalizedEmail),
        nome: name,
        googleId,
        avatar: picture,
        tokenVersion: 0,
      },
    });

    return { user, isNew: true };
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateAuthTokens(
    user: any,
  ): Promise<AuthTokensResponseDto & { isNew: boolean }> {
    // Generate access token
    const { token: accessToken, jti: accessJti } =
      await this.jwtService.generateAccessToken(
        user.id,
        user.emailMasked || undefined,
      );

    // Generate refresh token
    const {
      token: refreshToken,
      jti: refreshJti,
      expiresAt,
    } = await this.jwtService.generateRefreshToken(user.id);

    // Hash refresh token before storing
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        jti: refreshJti,
        expiresAt,
      },
    });

    // Update user's current JTI
    await this.prisma.user.update({
      where: { id: user.id },
      data: { jti: accessJti },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.emailMasked || undefined,
        name: user.nome || user.name || user.email,
        avatar: user.avatar,
        isNew: user.isNew || false,
      },
      isNew: user.isNew || false,
    };
  }

  /**
   * Handle the complete OAuth callback flow
   */
  async handleOAuthCallback(
    code: string,
  ): Promise<AuthTokensResponseDto & { isNew: boolean }> {
    // Exchange code for tokens
    const { idToken } = await this.exchangeCodeForTokens(code);

    // Verify and extract profile
    const googleProfile = await this.verifyGoogleIdToken(idToken);

    // Find or create user
    const { user, isNew } = await this.findOrCreateUser(googleProfile);

    // Generate auth tokens
    const tokens = await this.generateAuthTokens({ ...user, isNew });

    return tokens;
  }

  /**
   * Get authorization URL for frontend redirect
   */
  getGoogleAuthUrl(): { url: string; state: string } {
    const state = this.generateState();
    const url = this.getAuthorizationUrl(state);
    return { url, state };
  }

  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    const u = user || '';
    const d = domain || '';
    const maskedUser = u.length <= 2 ? `${u[0] || '*'}*` : `${u[0]}***${u.slice(-1)}`;
    const maskedDomain = d.length <= 3 ? `${d[0] || '*'}**` : `${d[0]}***${d.slice(-1)}`;
    return `${maskedUser}@${maskedDomain}`;
  }
}
