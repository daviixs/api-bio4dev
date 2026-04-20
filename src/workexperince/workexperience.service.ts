import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto,
} from 'src/dto/work-experience.dto';
import { ProfileOwnershipService } from 'src/security/profile-ownership.service';

@Injectable()
export class WorkexperienceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ownership: ProfileOwnershipService,
  ) {}

  async createWorkExperience(
    authenticatedUserId: string,
    data: CreateWorkExperienceDto,
  ) {
    const { profileId, technologies, responsibilities, ...workExperienceData } =
      data;

    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    return this.prisma.workExperience.create({
      data: {
        ...workExperienceData,
        profile: { connect: { id: profileId } },
        technologies: technologies
          ? {
              create: technologies.map((tech) => ({
                technology: tech.technology,
              })),
            }
          : undefined,
        responsibilities: responsibilities
          ? {
              create: responsibilities.map((resp) => ({
                responsibility: resp.responsibility,
                ordem: resp.ordem ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        technologies: true,
        responsibilities: {
          orderBy: { ordem: 'asc' },
        },
      },
    });
  }

  async findAll(authenticatedUserId: string) {
    return this.prisma.workExperience.findMany({
      where: {
        profile: {
          userId: authenticatedUserId,
        },
      },
      include: {
        technologies: true,
        responsibilities: {
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { ordem: 'asc' },
    });
  }

  async findByProfile(authenticatedUserId: string, profileId: string) {
    await this.ownership.assertProfileOwnership(profileId, authenticatedUserId);

    return this.prisma.workExperience.findMany({
      where: { profileId },
      include: {
        technologies: true,
        responsibilities: {
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { ordem: 'asc' },
    });
  }

  async findOne(authenticatedUserId: string, id: string) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
      include: {
        technologies: true,
        responsibilities: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!workExperience) {
      throw new NotFoundException(`WorkExperience com ID ${id} não encontrado`);
    }

    await this.ownership.assertProfileOwnership(
      workExperience.profileId,
      authenticatedUserId,
    );

    return workExperience;
  }

  async updateWorkExperience(
    authenticatedUserId: string,
    id: string,
    data: UpdateWorkExperienceDto,
  ) {
    await this.findOne(authenticatedUserId, id);

    const { technologies, responsibilities, ...workExperienceData } = data;
    if (technologies !== undefined) {
      await this.prisma.workTechnology.deleteMany({
        where: { workExperienceId: id },
      });
    }

    if (responsibilities !== undefined) {
      await this.prisma.workResponsibility.deleteMany({
        where: { workExperienceId: id },
      });
    }

    return this.prisma.workExperience.update({
      where: { id },
      data: {
        ...workExperienceData,
        technologies:
          technologies !== undefined
            ? {
                create: technologies.map((tech) => ({
                  technology: tech.technology,
                })),
              }
            : undefined,
        responsibilities:
          responsibilities !== undefined
            ? {
                create: responsibilities.map((resp) => ({
                  responsibility: resp.responsibility,
                  ordem: resp.ordem ?? 0,
                })),
              }
            : undefined,
      },
      include: {
        technologies: true,
        responsibilities: {
          orderBy: { ordem: 'asc' },
        },
      },
    });
  }

  async deleteWorkExperience(authenticatedUserId: string, id: string) {
    await this.findOne(authenticatedUserId, id);

    // Delete related records first to avoid foreign key constraint violations
    await this.prisma.workTechnology.deleteMany({
      where: { workExperienceId: id },
    });

    await this.prisma.workResponsibility.deleteMany({
      where: { workExperienceId: id },
    });

    // Finally delete the main record
    return this.prisma.workExperience.delete({
      where: { id },
    });
  }
}
