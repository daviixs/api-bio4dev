import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PageDto } from 'src/dto/page.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class PageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async create(authenticatedUserId: string, data: PageDto) {
    await this.ownership.assertProfileOwnership(
      data.profileId,
      authenticatedUserId,
    );

    const page = await this.prisma.page.create({
      data: {
        profileId: data.profileId,
        titulo: data.titulo,
        slug: data.slug,
        ordem: data.ordem,
      },
    });
    return {
      message: 'Página criada com sucesso!',
      page: {
        id: page.id,
        profileId: page.profileId,
        titulo: page.titulo,
        slug: page.slug,
      },
    };
  }

  async updatePage(authenticatedUserId: string, id: string, data: PageDto) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      select: { profileId: true },
    });

    if (!page) {
      throw new NotFoundException('Página não encontrada');
    }

    await this.ownership.assertProfileOwnership(
      page.profileId,
      authenticatedUserId,
    );

    return this.prisma.page.update({
      where: { id },
      data: {
        titulo: data.titulo,
        slug: data.slug,
        ordem: data.ordem,
      },
    });
  }

  async getPageById(authenticatedUserId: string, id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Página não encontrada');
    }

    await this.ownership.assertProfileOwnership(
      page.profileId,
      authenticatedUserId,
    );

    return page;
  }
}
