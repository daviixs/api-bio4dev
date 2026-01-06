import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async CreateProject(data: any) {
    const projectExists = await this.prisma.projeto.findFirst({
      where: {
        nome: data.nome,
      },
    });
    if (projectExists) {
      throw new Error('Project with this name already exists');
    }
    return this.prisma.projeto.create({
      data,
    });
  }

  async GetAllProjects(profileId?: string) {
    return this.prisma.projeto.findMany({
      where: profileId ? { profileId } : {},
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
