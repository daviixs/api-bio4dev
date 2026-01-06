import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSocialDto, UpdateSocialDto } from 'src/dto/social.dto';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSocialDto) {
    // Verifica se o perfil existe
    const profile = await this.prisma.profile.findUnique({
      where: { id: data.profileId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    // Verifica se já existe um link desta plataforma para este perfil
    const existingSocial = await this.prisma.social.findFirst({
      where: {
        profileId: data.profileId,
        plataforma: data.plataforma,
      },
    });

    if (existingSocial) {
      throw new ConflictException(
        'Já existe um link desta plataforma para este perfil',
      );
    }

    return this.prisma.social.create({
      data: {
        ...data,
        ordem: data.ordem ?? 0,
      },
    });
  }

  async findAll() {
    return this.prisma.social.findMany({
      select: {
        id: true,
        profileId: true,
      },
      orderBy: {
        ordem: 'asc',
      },
    });
  }

  async findByProfile(profileId: string) {
    // Verifica se o perfil existe
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return this.prisma.social.findMany({
      where: { profileId },
      orderBy: { ordem: 'asc' },
    });
  }

  async findOne(id: string) {
    const social = await this.prisma.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }

    return social;
  }

  async update(id: string, data: UpdateSocialDto) {
    // Verifica se existe
    const social = await this.prisma.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }

    // Se estiver atualizando a plataforma, verifica se não há conflito
    if (data.plataforma && data.plataforma !== social.plataforma) {
      const existingSocial = await this.prisma.social.findFirst({
        where: {
          profileId: social.profileId,
          plataforma: data.plataforma,
          id: { not: id },
        },
      });

      if (existingSocial) {
        throw new ConflictException(
          'Já existe um link desta plataforma para este perfil',
        );
      }
    }

    return this.prisma.social.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Verifica se existe
    const social = await this.prisma.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }

    await this.prisma.social.delete({
      where: { id },
    });

    return {
      message: 'Rede social removida com sucesso',
    };
  }
}
