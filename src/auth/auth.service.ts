import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../dto/users.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * @deprecated Email/password registration is no longer supported.
   * Use Google OAuth instead via /auth/google
   */
  async register(): Promise<never> {
    throw new BadRequestException(
      'Email/password registration is no longer supported. Please use Google Sign-In.',
    );
  }

  /**
   * @deprecated Email/password login is no longer supported.
   * Use Google OAuth instead via /auth/google
   */
  async login(): Promise<never> {
    throw new BadRequestException(
      'Email/password login is no longer supported. Please use Google Sign-In.',
    );
  }

  private _createToken(user: UserResponseDto): AuthToken {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);
    return {
      expiresIn: process.env.EXPIRESIN ?? '1h',
      access_token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}

export interface RegistrationStatus {
  success: boolean;
  message: string;
  user?: UserResponseDto;
}
export interface RegistrationSeederStatus {
  success: boolean;
  message: string;
  data?: UserResponseDto[];
}

export interface AuthToken {
  access_token: string;
  expiresIn: string | number;
}

export interface AuthResponse extends AuthToken {
  user: UserResponseDto;
}
