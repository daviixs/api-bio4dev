import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateFooterDto, UpdateFooterDto } from 'src/dto/footer.dto';

@Injectable()
export class FooterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFooterDto) {
    // Verifica se já existe footer para este profile
    const existingFooter = await this.prisma.footer.findUnique({
      where: { profileId: data.profileId },
    });

    // Se já existe, atualiza ao invés de erro
    if (existingFooter) {
      return this.prisma.footer.update({
        where: { profileId: data.profileId },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          email: data.email,
          github: data.github,
          linkedin: data.linkedin,
          twitter: data.twitter,
          copyrightName: data.copyrightName,
          madeWith: data.madeWith,
          resumeUrl: data.resumeUrl,
        },
      });
    }

    return this.prisma.footer.create({
      data: {
        profileId: data.profileId,
        title: data.title,
        subtitle: data.subtitle,
        email: data.email,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        copyrightName: data.copyrightName,
        madeWith: data.madeWith,
        resumeUrl: data.resumeUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.footer.findMany({
      include: {
        profile: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async findByProfile(profileId: string) {
    const footer = await this.prisma.footer.findUnique({
      where: { profileId },
    });

    if (!footer) {
      throw new NotFoundException(
        `Footer não encontrado para o profile ${profileId}`,
      );
    }

    return footer;
  }

  async findOne(id: string) {
    const footer = await this.prisma.footer.findUnique({
      where: { id },
    });

    if (!footer) {
      throw new NotFoundException(`Footer com ID ${id} não encontrado`);
    }

    return footer;
  }

  async update(id: string, data: UpdateFooterDto) {
    await this.findOne(id);

    return this.prisma.footer.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        email: data.email,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        copyrightName: data.copyrightName,
        madeWith: data.madeWith,
        resumeUrl: data.resumeUrl,
      },
    });
  }

  async updateByProfile(profileId: string, data: UpdateFooterDto) {
    const footer = await this.prisma.footer.findUnique({
      where: { profileId },
    });

    if (!footer) {
      throw new NotFoundException(
        `Footer não encontrado para o profile ${profileId}`,
      );
    }

    return this.prisma.footer.update({
      where: { profileId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        email: data.email,
        github: data.github,
        linkedin: data.linkedin,
        twitter: data.twitter,
        copyrightName: data.copyrightName,
        madeWith: data.madeWith,
        resumeUrl: data.resumeUrl,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.footer.delete({
      where: { id },
    });
  }

  async deleteByProfile(profileId: string) {
    const footer = await this.prisma.footer.findUnique({
      where: { profileId },
    });

    if (!footer) {
      throw new NotFoundException(
        `Footer não encontrado para o profile ${profileId}`,
      );
    }

    return this.prisma.footer.delete({
      where: { profileId },
    });
  }
}
