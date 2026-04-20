import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { UserRole } from '../dto/users.dto';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
  implements OnModuleInit
{
  private static publicKey: string;

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'https://api.bio4dev.com',
      audience: process.env.JWT_AUDIENCE || 'https://api.bio4dev.com',
      secretOrKeyProvider: async (
        _request: any,
        _rawJwtToken: string,
        done: (err: Error | null, key?: string) => void,
      ) => {
        try {
          if (!JwtStrategy.publicKey) {
            const publicKeyPath =
              process.env.JWT_PUBLIC_KEY || './keys/public.pem';
            const resolvedPath = publicKeyPath.startsWith('./')
              ? join(process.cwd(), publicKeyPath)
              : publicKeyPath;
            JwtStrategy.publicKey = await readFile(resolvedPath, 'utf-8');
          }
          done(null, JwtStrategy.publicKey);
        } catch (error) {
          done(error as Error);
        }
      },
    });
  }

  async onModuleInit() {
    // Pre-load the public key
    try {
      const publicKeyPath = process.env.JWT_PUBLIC_KEY || './keys/public.pem';
      const resolvedPath = publicKeyPath.startsWith('./')
        ? join(process.cwd(), publicKeyPath)
        : publicKeyPath;
      JwtStrategy.publicKey = await readFile(resolvedPath, 'utf-8');
      console.log('JWT Strategy: Public key loaded successfully');
    } catch (error) {
      console.error('JWT Strategy: Failed to load public key:', error);
    }
  }

  async validate(payload: JwtPayload): Promise<any> {
    if (!payload.sub) {
      throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.authService.validateUser(payload).catch(() => null);
    if (user) {
      return {
        ...user,
        userId: user.id,
        jti: payload.jti,
      };
    }

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  }
}

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: UserRole;
  jti?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
