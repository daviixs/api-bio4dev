import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ConfigDto } from 'src/dto/config.dto';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ConfigDto) {
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

  async updateConfig(id: string, data: ConfigDto) {
    return this.prisma.config.update({
      where: { id },
      data: {
        stacks: data.stacks,
        projetos: data.projetos,
      },
    });
  }

  async getConfigByProfileId(profileId: string) {
    return this.prisma.config.findFirst({
      where: { profileId },
    });
  }
}
