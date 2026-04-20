import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async CreateProject(authenticatedUserId: string, data: any) {
    await this.ownership.assertProfileOwnership(
      data.profileId,
      authenticatedUserId,
    );

    // Verifica se já existe um projeto com mesmo nome APENAS para evitar duplicatas acidentais
    const projectExists = await this.prisma.projeto.findFirst({
      where: {
        profileId: data.profileId,
        nome: data.nome,
      },
    });
    if (projectExists) {
      // Se já existe, retorna o existente ao invés de criar duplicado
      return projectExists;
    }
    return this.prisma.projeto.create({
      data,
    });
  }

  async GetAllProjects(authenticatedUserId: string, profileId?: string) {
    if (profileId) {
      await this.ownership.assertProfileOwnership(
        profileId,
        authenticatedUserId,
      );
    }

    return this.prisma.projeto.findMany({
      where: profileId
        ? { profileId }
        : {
            profile: {
              userId: authenticatedUserId,
            },
          },
      orderBy: { ordem: 'asc' },
    });
  }

  async UpdateProject(authenticatedUserId: string, id: string, data: any) {
    const projectExists = await this.prisma.projeto.findUnique({
      where: {
        id: id,
      },
    });
    if (!projectExists) {
      throw new NotFoundException(`Projeto com ID "${id}" não encontrado`);
    }

    await this.ownership.assertProfileOwnership(
      projectExists.profileId,
      authenticatedUserId,
    );

    return this.prisma.projeto.update({
      where: {
        id: id,
      },
      data,
    });
  }

  async DeleteProject(authenticatedUserId: string, id: string) {
    const projectExists = await this.prisma.projeto.findUnique({
      where: {
        id: id,
      },
    });
    if (!projectExists) {
      throw new Error('Project not found');
    }

    await this.ownership.assertProfileOwnership(
      projectExists.profileId,
      authenticatedUserId,
    );

    return this.prisma.projeto.delete({
      where: {
        id: id,
      },
    });
  }
}
