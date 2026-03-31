import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  UserRole,
  UserResponseDto,
  UpdateUserDto,
  UpdatePreferencesDto,
} from '../dto/users.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * @deprecated Email/password registration is no longer supported.
   * Use Google OAuth instead via /auth/google
   */
  async create(): Promise<never> {
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

  /**
   * @deprecated Email/password login is no longer supported.
   * Use Google OAuth instead via /auth/google
   */
  async findByLogin(): Promise<never> {
    throw new BadRequestException(
      'Email/password login is no longer supported. Please use Google Sign-In.',
    );
  }

  async findByPayload(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    return this.toResponse(user);
  }

  /**
   * @deprecated Password management is no longer supported with Google OAuth.
   */
  async updatePassword(): Promise<never> {
    throw new BadRequestException(
      'Password management is not available with Google OAuth authentication.',
    );
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const data: any = {
      email: dto.email,
      nome: dto.nome,
      username: dto.username,
    };

    const prismaRole = this.toPrismaRole(dto.role);
    if (prismaRole) data.role = prismaRole;

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return {
      message: 'Usuário atualizado com sucesso',
      user: this.toResponse(user),
    };
  }

  async updatePreferences(id: string, dto: UpdatePreferencesDto) {
    await this.prisma.user.update({
      where: { id },
      data: {
        emailNotifications: dto.emailNotifications,
        marketingEmails: dto.marketingEmails,
        securityAlerts: dto.securityAlerts,
        language: dto.language,
        timezone: dto.timezone,
      },
    });

    return { message: 'Preferências atualizadas' };
  }

  async enable2FA(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { twoFactorEnabled: true },
    });
    return { message: '2FA enabled (stub)' };
  }

  async disable2FA(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { twoFactorEnabled: false },
    });
    return { message: '2FA disabled (stub)' };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.toResponse(user);
  }

  toResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      username: user.username,
      emailNotifications: user.emailNotifications,
      marketingEmails: user.marketingEmails,
      securityAlerts: user.securityAlerts,
      language: user.language,
      timezone: user.timezone,
      twoFactorEnabled: user.twoFactorEnabled,
      role: this.toApiRole(user.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toPrismaRole(role?: UserRole): Role | undefined {
    if (!role) return undefined;
    switch (role) {
      case UserRole.USER:
        return Role.CLIENT;
      case UserRole.PLATFORM_ADMIN:
        return Role.ADMIN;
      default:
        return undefined;
    }
  }

  private toApiRole(role?: Role | null): UserRole {
    switch (role) {
      case Role.ADMIN:
      case Role.ROOT:
        return UserRole.PLATFORM_ADMIN;
      case Role.CLIENT:
      default:
        return UserRole.USER;
    }
  }
}
