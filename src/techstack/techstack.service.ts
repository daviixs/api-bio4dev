import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTechStackDto, UpdateTechStackDto } from 'src/dto/tech-stack.dto';

@Injectable()
export class TechstackService {
  constructor(private readonly prisma: PrismaService) {}

  async getTechStackByProfile(profileId: string) {
    return this.prisma.techStack.findUnique({
      where: { profileId },
      include: { technologies: { orderBy: { ordem: 'asc' } } },
    });
  }

  async getTechStackById(id: string) {
    const techStack = await this.prisma.techStack.findUnique({
      where: { id },
      include: { technologies: { orderBy: { ordem: 'asc' } } },
    });

    if (!techStack) {
      throw new NotFoundException(`TechStack with ID ${id} not found`);
    }

    return techStack;
  }

  async create(profileId: string, dto: CreateTechStackDto) {
    const exists = await this.prisma.techStack.findUnique({
      where: { profileId },
    });
    if (exists) {
      throw new Error('TechStack already exists for this profile');
    }

    return this.prisma.techStack.create({
      data: {
        profileId,
        title: dto.title,
        subtitle: dto.subtitle,
        technologies: dto.technologies
          ? {
              create: dto.technologies.map((t) => ({
                name: t.name,
                icon: t.icon,
                color: t.color,
                ordem: t.ordem ?? 0,
              })),
            }
          : undefined,
      },
      include: { technologies: { orderBy: { ordem: 'asc' } } },
    });
  }

  async update(profileId: string, dto: UpdateTechStackDto) {
    return this.prisma.techStack.update({
      where: { profileId },
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        ...(dto.technologies
          ? {
              technologies: {
                deleteMany: {},
                create: dto.technologies.map((t) => ({
                  name: t.name,
                  icon: t.icon,
                  color: t.color,
                  ordem: t.ordem ?? 0,
                })),
              },
            }
          : {}),
      },
      include: { technologies: { orderBy: { ordem: 'asc' } } },
    });
  }

  async deleteTechStackById(id: string) {
    const techStack = await this.prisma.techStack.findUnique({
      where: { id },
    });

    if (!techStack) {
      throw new NotFoundException(`TechStack with ID ${id} not found`);
    }

    return this.prisma.techStack.delete({
      where: { id },
      include: { technologies: true },
    });
  }

  async deleteTechStackByProfile(profileId: string) {
    const techStack = await this.prisma.techStack.findUnique({
      where: { profileId },
    });

    if (!techStack) {
      throw new NotFoundException(
        `TechStack for profile ${profileId} not found`,
      );
    }

    return this.prisma.techStack.delete({
      where: { profileId },
      include: { technologies: true },
    });
  }
}
