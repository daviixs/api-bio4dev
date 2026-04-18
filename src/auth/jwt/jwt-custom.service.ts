import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFile } from 'fs/promises';
import {
  SignJWT,
  jwtVerify,
  importPKCS8,
  importSPKI,
  type JWTPayload,
} from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

export interface TokenPayload extends JWTPayload {
  sub: string;
  email?: string;
  jti?: string;
}

type KeyLikeType = Awaited<ReturnType<typeof importPKCS8>>;

@Injectable()
export class JwtCustomService implements OnModuleInit {
  private privateKey: KeyLikeType;
  private publicKey: KeyLikeType;
  private issuer: string;
  private audience: string;
  private accessTokenExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor() {
    this.issuer = process.env.JWT_ISSUER || 'https://api.bio4dev.com';
    this.audience = process.env.JWT_AUDIENCE || 'https://api.bio4dev.com';
    this.accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  async onModuleInit() {
    await this.loadKeys();
  }

  private async loadKeys(): Promise<void> {
    try {
      const privateKeyPath =
        process.env.JWT_PRIVATE_KEY || './keys/private.pem';
      const publicKeyPath = process.env.JWT_PUBLIC_KEY || './keys/public.pem';

      const resolvedPrivatePath = privateKeyPath.startsWith('./')
        ? join(process.cwd(), privateKeyPath)
        : privateKeyPath;
      const resolvedPublicPath = publicKeyPath.startsWith('./')
        ? join(process.cwd(), publicKeyPath)
        : publicKeyPath;

      const privateKeyPem = await readFile(resolvedPrivatePath, 'utf-8');
      const publicKeyPem = await readFile(resolvedPublicPath, 'utf-8');

      this.privateKey = await importPKCS8(privateKeyPem, 'RS256');
      this.publicKey = await importSPKI(publicKeyPem, 'RS256');

      console.log('JWT RS256 keys loaded successfully');
    } catch (error) {
      console.error('Failed to load JWT keys:', error);
      throw new Error(
        'Failed to initialize JWT service: Could not load RSA keys',
      );
    }
  }

  async generateAccessToken(
    userId: string,
    email: string,
  ): Promise<{ token: string; jti: string }> {
    const jti = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'current' })
      .setSubject(userId)
      .setIssuedAt(now)
      .setNotBefore(now)
      .setExpirationTime(this.accessTokenExpiresIn)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setJti(jti)
      .sign(this.privateKey);

    return { token, jti };
  }

  async generateRefreshToken(
    userId: string,
  ): Promise<{ token: string; jti: string; expiresAt: Date }> {
    const jti = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    // Parse expiration time (e.g., "7d" -> 7 days)
    const expiresAt = this.calculateExpirationDate(this.refreshTokenExpiresIn);

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'current' })
      .setSubject(userId)
      .setIssuedAt(now)
      .setExpirationTime(this.refreshTokenExpiresIn)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setJti(jti)
      .sign(this.privateKey);

    return { token, jti, expiresAt };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.audience,
        clockTolerance: 30, // 30 seconds tolerance
      });

      return payload as TokenPayload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      // Decode without verification (for extracting claims)
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  getPublicKey(): KeyLikeType {
    return this.publicKey;
  }

  private calculateExpirationDate(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      // Default to 7 days if parsing fails
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}
