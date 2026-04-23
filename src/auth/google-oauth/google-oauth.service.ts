import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtCustomService } from '../jwt/jwt-custom.service';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import {
  GoogleProfileDto,
  IssuedAuthTokensResponseDto,
} from './dto/google-oauth.dto';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

type OAuthHandoffPayload = {
  version: 1;
  nonce: string;
  issuedAt: number;
};

type VerifiedOAuthHandoffPayload = OAuthHandoffPayload & {
  codeVerifier: string;
};

type FrontendCallbackStatus = 'success' | 'error';

@Injectable()
export class GoogleOAuthService {
  private oauth2Client: OAuth2Client;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private frontendRedirectUri: string;
  private emailHmacKey: string;
  private bcryptRounds: number;
  private oauthStateSecret: string;
  private readonly oauthHandoffTtlMs = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtCustomService,
  ) {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:3000/auth/google/callback';
    this.frontendRedirectUri =
      process.env.GOOGLE_FRONTEND_REDIRECT_URI ||
      'http://localhost:4000/auth/callback/google';
    this.emailHmacKey = process.env.EMAIL_HMAC_KEY || '';
    this.bcryptRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    this.oauthStateSecret =
      process.env.GOOGLE_OAUTH_COOKIE_SECRET ||
      this.emailHmacKey ||
      process.env.JWT_SECRET ||
      '';

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
    return createHmac('sha256', this.emailHmacKey).update(email).digest('hex');
  }

  /**
   * Generate the Google OAuth authorization URL
   */
  getAuthorizationUrl(options: {
    state: string;
    codeChallenge?: string;
  }): string {
    const scopes = ['openid', 'email', 'profile'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: options.state,
      redirect_uri: this.redirectUri,
      ...(options.codeChallenge
        ? {
            code_challenge: options.codeChallenge,
            code_challenge_method: CodeChallengeMethod.S256,
          }
        : {}),
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier?: string,
  ): Promise<{ idToken: string; accessToken: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken({
        code,
        redirect_uri: this.redirectUri,
        codeVerifier,
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

      const googleId = payload.sub?.trim();
      const email = this.normalizeEmail(payload.email || '');
      const name = this.normalizeDisplayName(payload.name, payload.email || '');
      const picture = this.normalizeAvatarUrl(payload.picture);

      if (!googleId || !email) {
        throw new UnauthorizedException('Invalid Google profile payload');
      }

      return {
        googleId,
        email,
        emailVerified: payload.email_verified === true,
        name,
        picture,
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
    const { googleId, email, emailVerified, name, picture } = googleProfile;
    const normalizedEmail = email;
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
        updates.emailBcrypt = await bcrypt.hash(
          normalizedEmail,
          this.bcryptRounds,
        );
      }

      if (!user.emailMasked) {
        updates.emailMasked = this.maskEmail(normalizedEmail);
      }

      if (Object.keys(updates).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }

      return { user, isNew: false };
    }

    if (!emailVerified) {
      throw new UnauthorizedException(
        'Google account email must be verified before sign-in',
      );
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
  async generateAuthTokens(user: any): Promise<IssuedAuthTokensResponseDto> {
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
    codeVerifier?: string,
  ): Promise<IssuedAuthTokensResponseDto> {
    // Exchange code for tokens
    const { idToken } = await this.exchangeCodeForTokens(code, codeVerifier);

    // Verify and extract profile
    const googleProfile = await this.verifyGoogleIdToken(idToken);

    // Find or create user
    const { user, isNew } = await this.findOrCreateUser(googleProfile);

    // Generate auth tokens
    const tokens = await this.generateAuthTokens({ ...user, isNew });

    return tokens;
  }

  /**
   * Create backend-owned OAuth start payload for direct browser navigation
   */
  async createGoogleAuthRedirect(): Promise<{
    url: string;
    state: string;
  }> {
    const handoff = {
      version: 1 as const,
      nonce: this.generateNonce(),
      issuedAt: Date.now(),
    };
    const state = this.signOAuthHandoff(handoff);
    const codeVerifier = this.createCodeVerifier(handoff);
    const codeChallenge = this.createCodeChallenge(codeVerifier);
    const url = this.getAuthorizationUrl({
      state,
      codeChallenge,
    });
    return { url, state };
  }

  verifyOAuthState(
    state: string | undefined,
  ): VerifiedOAuthHandoffPayload | null {
    if (!state) {
      return null;
    }

    const [encodedPayload, signature] = state.split('.');
    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = this.createHandoffSignature(encodedPayload);
    const actualSignatureBuffer = Buffer.from(signature, 'utf8');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');

    if (actualSignatureBuffer.length !== expectedSignatureBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)) {
      return null;
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<OAuthHandoffPayload>;

      if (
        parsed.version !== 1 ||
        typeof parsed.nonce !== 'string' ||
        typeof parsed.issuedAt !== 'number'
      ) {
        return null;
      }

      if (!/^[a-f0-9]{48}$/i.test(parsed.nonce)) {
        return null;
      }

      if (Date.now() - parsed.issuedAt > this.oauthHandoffTtlMs) {
        return null;
      }

      return {
        version: 1,
        nonce: parsed.nonce,
        issuedAt: parsed.issuedAt,
        codeVerifier: this.createCodeVerifier({
          version: 1,
          nonce: parsed.nonce,
          issuedAt: parsed.issuedAt,
        }),
      };
    } catch {
      return null;
    }
  }

  buildFrontendCallbackUrl(
    status: FrontendCallbackStatus,
    reason?: string,
  ): string {
    const url = new URL(this.frontendRedirectUri);
    url.searchParams.set('status', status);
    if (reason) {
      url.searchParams.set('reason', this.sanitizeFrontendReason(reason));
    }
    return url.toString();
  }

  mapOAuthProviderError(error: string): string {
    if (error === 'access_denied') {
      return 'access_denied';
    }

    return 'oauth_provider_error';
  }

  private generateNonce(): string {
    return randomBytes(24).toString('hex');
  }

  private signOAuthHandoff(payload: OAuthHandoffPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = this.createHandoffSignature(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  private createHandoffSignature(encodedPayload: string): string {
    return createHmac('sha256', this.oauthStateSecret)
      .update(encodedPayload)
      .digest('base64url');
  }

  private createCodeVerifier(payload: OAuthHandoffPayload): string {
    return createHmac('sha256', this.oauthStateSecret)
      .update(`${payload.version}:${payload.nonce}:${payload.issuedAt}`)
      .digest('base64url');
  }

  private createCodeChallenge(codeVerifier: string): string {
    return createHash('sha256').update(codeVerifier).digest('base64url');
  }

  private sanitizeFrontendReason(reason: string): string {
    return /^[a-z0-9_-]+$/i.test(reason) ? reason : 'oauth_callback_failed';
  }

  private maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    const u = user || '';
    const d = domain || '';
    const maskedUser =
      u.length <= 2 ? `${u[0] || '*'}*` : `${u[0]}***${u.slice(-1)}`;
    const maskedDomain =
      d.length <= 3 ? `${d[0] || '*'}**` : `${d[0]}***${d.slice(-1)}`;
    return `${maskedUser}@${maskedDomain}`;
  }

  private normalizeDisplayName(name?: string, email?: string): string {
    const fallback = email?.split('@')[0] || 'User';
    const normalized = (name || fallback).trim();
    return normalized.slice(0, 120) || 'User';
  }

  private normalizeAvatarUrl(picture?: string): string | undefined {
    if (!picture) {
      return undefined;
    }

    try {
      const url = new URL(picture);
      if (url.protocol !== 'https:') {
        return undefined;
      }
      return url.toString();
    } catch {
      return undefined;
    }
  }
}
