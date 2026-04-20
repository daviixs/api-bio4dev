import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSocialDto, UpdateSocialDto } from 'src/dto/social.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async create(authenticatedUserId: string, data: CreateSocialDto) {
    await this.ownership.assertProfileOwnership(
      data.profileId,
      authenticatedUserId,
    );

    // Verifica se já existe um link desta plataforma para este perfil
    const existingSocial = await this.prisma.social.findFirst({
      where: {
        profileId: data.profileId,
        plataforma: data.plataforma,
      },
    });

    // Se já existe, atualiza ao invés de erro
    if (existingSocial) {
      return this.prisma.social.update({
        where: { id: existingSocial.id },
        data: {
          url: data.url,
          ordem: data.ordem ?? existingSocial.ordem,
        },
      });
    }

    return this.prisma.social.create({
      data: {
        ...data,
        ordem: data.ordem ?? 0,
      },
    });
  }

  async findAll(authenticatedUserId: string) {
    return this.prisma.social.findMany({
      where: {
        profile: {
          userId: authenticatedUserId,
        },
      },
      select: {
        id: true,
        profileId: true,
      },
      orderBy: {
        ordem: 'asc',
      },
    });
  }

  async findByProfile(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    return this.prisma.social.findMany({
      where: { profileId },
      orderBy: { ordem: 'asc' },
    });
  }

  async findOne(authenticatedUserId: string, id: string) {
    const social = await this.prisma.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }

    await this.ownership.assertProfileOwnership(
      social.profileId,
      authenticatedUserId,
    );

    return social;
  }

  async update(
    authenticatedUserId: string,
    id: string,
    data: UpdateSocialDto,
  ) {
    // Verifica se existe
    const social = await this.prisma.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }

    await this.ownership.assertProfileOwnership(
      social.profileId,
      authenticatedUserId,
    );

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

  async delete(authenticatedUserId: string, id: string) {
    // Verifica se existe
    const social = await this.prisma.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException('Rede social não encontrada');
    }

    await this.ownership.assertProfileOwnership(
      social.profileId,
      authenticatedUserId,
    );

    await this.prisma.social.delete({
      where: { id },
    });

    return {
      message: 'Rede social removida com sucesso',
    };
  }
}
