import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from 'src/dto/profiles.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProfileDto) {
    const profile = await this.prisma.profile.create({
      data: {
        userId: data.userId,
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        theme: data.theme ?? 'LIGHT',
        mainColor: data.mainColor,
        templateType: data.templateType,
        published: data.published ?? false,
      },
    });
    return {
      message: 'Perfil criado com sucesso!',
      profile: {
        id: profile.id,
        userId: profile.userId,
        username: profile.username,
        theme: profile.theme,
        mainColor: profile.mainColor,
        templateType: profile.templateType,
      },
    };
  }

  async updateProfile(id: string, data: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id },
      data: {
        username: data.username,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        theme: data.theme,
        mainColor: data.mainColor,
        templateType: data.templateType,
        published: data.published,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        username: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        mainColor: true,
        templateType: true,
        published: true,
        createdAt: true,
      },
    });
  }
}
