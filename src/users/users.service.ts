import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserDto } from 'src/dto/users.dto';

@Injectable()
export class UsersService {

    constructor (private prisma: PrismaService) {}

    async create(data: UserDto) {
        await this.prisma.users.create({ data });

        return { message: 'Usuário criado com sucesso!' };
    }
}