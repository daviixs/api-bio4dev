import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateLinkButtonDto,
  UpdateLinkButtonDto,
} from 'src/dto/link-button.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class LinkButtonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async create(authenticatedUserId: string, data: CreateLinkButtonDto) {
    await this.ownership.assertProfileOwnership(
      data.profileId,
      authenticatedUserId,
    );

    const linkButton = await this.prisma.linkButton.create({
      data: {
        profileId: data.profileId,
        label: data.label,
        url: data.url,
        subtext: data.subtext,
        icon: data.icon,
        style: data.style,
        ordem: data.ordem ?? 0,
        ativo: data.ativo ?? true,
      },
    });

    return { message: 'Link button criado com sucesso!', linkButton };
  }

  async findAll(authenticatedUserId: string) {
    return this.prisma.linkButton.findMany({
      where: {
        profile: {
          userId: authenticatedUserId,
        },
      },
      orderBy: { ordem: 'asc' },
    });
  }

  async findByProfileId(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    return this.prisma.linkButton.findMany({
      where: { profileId },
      orderBy: { ordem: 'asc' },
    });
  }

  async findOne(authenticatedUserId: string, id: string) {
    const linkButton = await this.prisma.linkButton.findUnique({
      where: { id },
    });

    if (!linkButton) {
      throw new NotFoundException('Link button não encontrado');
    }

    await this.ownership.assertProfileOwnership(
      linkButton.profileId,
      authenticatedUserId,
    );

    return linkButton;
  }

  async update(
    authenticatedUserId: string,
    id: string,
    data: UpdateLinkButtonDto,
  ) {
    const existing = await this.prisma.linkButton.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Link button não encontrado');
    }

    await this.ownership.assertProfileOwnership(
      existing.profileId,
      authenticatedUserId,
    );

    return this.prisma.linkButton.update({
      where: { id },
      data: {
        label: data.label,
        url: data.url,
        subtext: data.subtext,
        icon: data.icon,
        style: data.style,
        ordem: data.ordem,
        ativo: data.ativo,
      },
    });
  }

  async delete(authenticatedUserId: string, id: string) {
    const existing = await this.prisma.linkButton.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Link button não encontrado');
    }

    await this.ownership.assertProfileOwnership(
      existing.profileId,
      authenticatedUserId,
    );

    await this.prisma.linkButton.delete({
      where: { id },
    });

    return { message: 'Link button deletado com sucesso!' };
  }

  async deleteAllByProfileId(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    await this.prisma.linkButton.deleteMany({
      where: { profileId },
    });

    return { message: 'Todos os link buttons do perfil foram deletados!' };
  }

  async upsertMany(
    authenticatedUserId: string,
    profileId: string,
    buttons: CreateLinkButtonDto[],
  ) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    // Delete all existing buttons for this profile
    await this.prisma.linkButton.deleteMany({
      where: { profileId },
    });

    // Create new buttons
    const createdButtons = await Promise.all(
      buttons.map((button, index) =>
        this.prisma.linkButton.create({
          data: {
            profileId,
            label: button.label,
            url: button.url,
            subtext: button.subtext,
            icon: button.icon,
            style: button.style,
            ordem: button.ordem ?? index,
            ativo: button.ativo ?? true,
          },
        }),
      ),
    );

    return {
      message: 'Link buttons salvos com sucesso!',
      linkButtons: createdButtons,
    };
  }
}
