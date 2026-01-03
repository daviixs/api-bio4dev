import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PageDto } from 'src/dto/page.dto';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}

  async create(data: PageDto) {
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

  async updatePage(id: string, data: PageDto) {
    return this.prisma.page.update({
      where: { id },
      data: {
        titulo: data.titulo,
        slug: data.slug,
        ordem: data.ordem,
      },
    });
  }

  async getPageById(id: string) {
    return this.prisma.page.findUnique({
      where: { id },
    });
  }
}
