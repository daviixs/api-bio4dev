import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTechStackDto, UpdateTechStackDto } from 'src/dto/tech-stack.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class TechstackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async getTechStackByProfile(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    return this.prisma.techStack.findUnique({
      where: { profileId },
      include: { technologies: { orderBy: { ordem: 'asc' } } },
    });
  }

  async getTechStackById(authenticatedUserId: string, id: string) {
    const techStack = await this.prisma.techStack.findUnique({
      where: { id },
      include: { technologies: { orderBy: { ordem: 'asc' } } },
    });

    if (!techStack) {
      throw new NotFoundException(`TechStack with ID ${id} not found`);
    }

    await this.ownership.assertProfileOwnership(
      techStack.profileId,
      authenticatedUserId,
    );

    return techStack;
  }

  async create(
    authenticatedUserId: string,
    profileId: string,
    dto: CreateTechStackDto,
  ) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    const exists = await this.prisma.techStack.findUnique({
      where: { profileId },
    });

    // Se já existe, faz update ao invés de erro
    if (exists) {
      return this.update(authenticatedUserId, profileId, dto);
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

  async update(
    authenticatedUserId: string,
    profileId: string,
    dto: UpdateTechStackDto,
  ) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

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

  async deleteTechStackById(authenticatedUserId: string, id: string) {
    const techStack = await this.prisma.techStack.findUnique({
      where: { id },
    });

    if (!techStack) {
      throw new NotFoundException(`TechStack with ID ${id} not found`);
    }

    await this.ownership.assertProfileOwnership(
      techStack.profileId,
      authenticatedUserId,
    );

    return this.prisma.techStack.delete({
      where: { id },
      include: { technologies: true },
    });
  }

  async deleteTechStackByProfile(
    authenticatedUserId: string,
    profileId: string,
  ) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

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
