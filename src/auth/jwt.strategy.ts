import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRole } from '../dto/users.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // Accept both legacy SECRETKEY and standard JWT_SECRET for flexibility
    const secret = process.env.JWT_SECRET || process.env.SECRETKEY;
    if (!secret) {
      throw new Error('JWT_SECRET (ou SECRETKEY) não configurada no ambiente');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
