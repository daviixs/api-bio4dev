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
} from '../dto/users.dto';
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

    const senhaOk = await compare(dto.senhaAtual, user.senha);
    if (!senhaOk) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const novaHash = await hash(dto.novaSenha, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { senha: novaHash },
    });
    return { message: 'Senha atualizada com sucesso' };
  }

  toResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role ?? UserRole.USER,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
