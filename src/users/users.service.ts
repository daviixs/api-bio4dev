import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserDto } from 'src/dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: UserDto) {
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
}
