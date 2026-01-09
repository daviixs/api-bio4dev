import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from 'src/dto/profiles.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.profile.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

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

  async findByUsername(username: string, previewToken?: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      include: {
        legendas: true,
        social: {
          orderBy: { ordem: 'asc' },
        },
        config: true,
        projetos: {
          orderBy: { ordem: 'asc' },
        },
        techStack: {
          include: {
            technologies: {
              orderBy: { ordem: 'asc' },
            },
          },
        },
        workHistory: {
          include: {
            technologies: true,
            responsibilities: {
              orderBy: { ordem: 'asc' },
            },
          },
          orderBy: { ordem: 'asc' },
        },
        footer: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile com username "${username}" não encontrado`,
      );
    }

    // Se tem token de preview, valida o token
    if (previewToken) {
      const validToken = await this.prisma.previewToken.findFirst({
        where: {
          token: previewToken,
          profileId: profile.id,
          expiresAt: {
            gt: new Date(), // Token não expirado
          },
        },
      });

      if (!validToken) {
        throw new UnauthorizedException(
          'Token de preview inválido ou expirado',
        );
      }

      // Token válido - retorna perfil mesmo não publicado
      return profile;
    }

    // Sem token - só retorna se publicado
    if (!profile.published) {
      throw new ForbiddenException(`Profile "${username}" não está publicado`);
    }

    return profile;
  }

  async findCompleteById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        legendas: true,
        social: {
          orderBy: { ordem: 'asc' },
        },
        config: true,
        projetos: {
          orderBy: { ordem: 'asc' },
        },
        techStack: {
          include: {
            technologies: {
              orderBy: { ordem: 'asc' },
            },
          },
        },
        workHistory: {
          include: {
            technologies: true,
            responsibilities: {
              orderBy: { ordem: 'asc' },
            },
          },
          orderBy: { ordem: 'asc' },
        },
        footer: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile com ID "${id}" não encontrado`);
    }

    return profile;
  }

  async generatePreviewToken(profileId: string) {
    // Verifica se o perfil existe
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile não encontrado');
    }

    // Remove tokens antigos expirados deste perfil
    await this.prisma.previewToken.deleteMany({
      where: {
        profileId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Cria novo token válido por 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const previewToken = await this.prisma.previewToken.create({
      data: {
        profileId,
        expiresAt,
      },
    });

    return {
      token: previewToken.token,
      expiresAt: previewToken.expiresAt.toISOString(),
    };
  }
}
