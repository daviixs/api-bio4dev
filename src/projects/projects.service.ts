import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateProject(data: any) {
    const projectExists = await this.prisma.projeto.findFirst({
      where: {
        profileId: data.profileId,
        nome: data.nome,
      },
    });
    if (projectExists) {
      throw new ConflictException(`Projeto com o nome "${data.nome}" já existe neste perfil.`);
    }
    return this.prisma.projeto.create({
      data,
    });
  }

  async GetAllProjects(profileId?: string) {
    return this.prisma.projeto.findMany({
      where: profileId ? { profileId } : {},
      orderBy: { ordem: 'asc' },
    });
  }

  async UpdateProject(id: string, data: any) {
    const projectExists = await this.prisma.projeto.findUnique({
      where: {
        id: id,
      },
    });
    if (!projectExists) {
      throw new Error('Project not found');
    }
    return this.prisma.projeto.update({
      where: {
        id: id,
      },
      data,
    });
  }

  async DeleteProject(id: string) {
    const projectExists = await this.prisma.projeto.findUnique({
      where: {
        id: id,
      },
    });
    if (!projectExists) {
      throw new Error('Project not found');
    }
    return this.prisma.projeto.delete({
      where: {
        id: id,
      },
    });
  }
}
