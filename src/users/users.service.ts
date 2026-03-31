import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateUserDto,
  LoginDto,
  UpdatePasswordDto,
  UserRole,
  UserResponseDto,
  UpdateUserDto,
  UpdatePreferencesDto,
} from '../dto/users.dto';
import { Role } from '@prisma/client';
import { hash, compare } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const senhaHash = await hash(data.senha, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        senha: senhaHash,
        nome: data.nome,
        // role ainda não existe no schema; quando existir, remover fallback
      },
    });

    return {
      message: 'Usuário criado com sucesso!',
      user: this.toResponse(user),
    };
  }

  async login(data: LoginDto) {
    const user = await this.findByLogin(data);
    return {
      message: 'Login realizado com sucesso!',
      user: this.toResponse(user),
    };
  }

  async findByLogin({ email, senha }: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const senhaConfere = await compare(senha, user.senha);
    if (!senhaConfere) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    return user;
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

  async updatePassword(dto: UpdatePasswordDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const senhaOk = await compare(dto.oldPassword, user.senha);
    if (!senhaOk) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const novaHash = await hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { senha: novaHash },
    });
    return { message: 'Senha atualizada com sucesso' };
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
    return { message: 'Usuário atualizado com sucesso', user: this.toResponse(user) };
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
    await this.prisma.user.update({ where: { id }, data: { twoFactorEnabled: true } });
    return { message: '2FA enabled (stub)' };
  }

  async disable2FA(id: string) {
    await this.prisma.user.update({ where: { id }, data: { twoFactorEnabled: false } });
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
