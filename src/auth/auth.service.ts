import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserDto,
  LoginDto,
  UserResponseDto,
} from '../dto/users.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'ACCOUNT_CREATE_SUCCESS',
    };

    try {
      const created = await this.usersService.create(userDto);
      status.user = created.user;
    } catch (err) {
      status = {
        success: false,
        message: err?.message ?? 'ACCOUNT_CREATE_ERROR',
      };
    }
    return status;
  }

  async login(loginUserDto: LoginDto): Promise<AuthResponse> {
    const userEntity = await this.usersService.findByLogin(loginUserDto);
    const user = this.usersService.toResponse(userEntity);

    const token = this._createToken(user);

    return {
      ...token,
      user,
    };
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
