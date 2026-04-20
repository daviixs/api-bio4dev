import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateFooterDto, UpdateFooterDto } from 'src/dto/footer.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class FooterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async create(authenticatedUserId: string, data: CreateFooterDto) {
    await this.ownership.assertProfileOwnership(
      data.profileId,
      authenticatedUserId,
    );

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

  async findAll(authenticatedUserId: string) {
    return this.prisma.footer.findMany({
      where: {
        profile: {
          userId: authenticatedUserId,
        },
      },
      include: {
        profile: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async findByProfile(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

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

  async findOne(authenticatedUserId: string, id: string) {
    const footer = await this.prisma.footer.findUnique({
      where: { id },
    });

    if (!footer) {
      throw new NotFoundException(`Footer com ID ${id} não encontrado`);
    }

    await this.ownership.assertProfileOwnership(
      footer.profileId,
      authenticatedUserId,
    );

    return footer;
  }

  async update(
    authenticatedUserId: string,
    id: string,
    data: UpdateFooterDto,
  ) {
    await this.findOne(authenticatedUserId, id);

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

  async updateByProfile(
    authenticatedUserId: string,
    profileId: string,
    data: UpdateFooterDto,
  ) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

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

  async delete(authenticatedUserId: string, id: string) {
    await this.findOne(authenticatedUserId, id);

    return this.prisma.footer.delete({
      where: { id },
    });
  }

  async deleteByProfile(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

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
