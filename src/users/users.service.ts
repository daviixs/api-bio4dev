import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserDto, LoginDto } from 'src/dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: UserDto) {
    // Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        senha: data.senha,
        nome: data.nome,
      },
    });

    return {
      message: 'Usuário criado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        createdAt: user.createdAt,
      },
    };
  }

  async login(data: LoginDto) {
    // Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // Verificar se o usuário existe
    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Verificar a senha (comparação simples sem hash)
    if (user.senha !== data.senha) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    return {
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        createdAt: user.createdAt,
      },
    };
  }
}
