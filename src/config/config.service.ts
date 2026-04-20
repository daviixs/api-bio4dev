import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ConfigDto, UpdateConfigDto } from 'src/dto/config.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class ConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async create(authenticatedUserId: string, data: ConfigDto) {
    await this.ownership.assertProfileOwnership(
      data.profileId,
      authenticatedUserId,
    );

    const config = await this.prisma.config.create({
      data: {
        profileId: data.profileId,
        stacks: data.stacks,
        projetos: data.projetos,
      },
    });
    return {
      message: 'Configuração criada com sucesso!',
      config: {
        id: config.id,
        profileId: config.profileId,
        stacks: config.stacks,
        projetos: config.projetos,
      },
    };
  }

  async updateConfig(
    authenticatedUserId: string,
    id: string,
    data: UpdateConfigDto,
  ) {
    const config = await this.prisma.config.findUnique({
      where: { id },
      select: { profileId: true },
    });

    if (!config) {
      throw new NotFoundException('Configuração não encontrada');
    }

    await this.ownership.assertProfileOwnership(
      config.profileId,
      authenticatedUserId,
    );

    return this.prisma.config.update({
      where: { id },
      data: {
        stacks: data.stacks,
        projetos: data.projetos,
      },
    });
  }

  async getConfigByProfileId(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    return this.prisma.config.findFirst({
      where: { profileId },
    });
  }
}
