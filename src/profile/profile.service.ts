import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  DuplicateProfileDto,
  SetActiveProfileDto,
} from 'src/dto/profiles.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.profile.findMany({
      select: {
        id: true,
        userId: true,
        username: true,
        slug: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        mainColor: true,
        templateType: true,
        published: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateProfileDto) {
    // ✅ VALIDAR: usuário existe?
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userExists) {
      throw new BadRequestException(
        'Usuário não encontrado. Por favor, faça login novamente.',
      );
    }

    // ✅ VALIDAR: usuário já tem 3 portfolios?
    const count = await this.prisma.profile.count({
      where: { userId: data.userId },
    });

    if (count >= 3) {
      throw new BadRequestException(
        'Limite atingido: você pode ter no máximo 3 portfolios. Exclua um para criar outro.',
      );
    }

    // ✅ GERAR SLUG único (username => url-safe; adicionar sufixo se colidir)
    let slug = data.username.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    let counter = 1;

    while (await this.prisma.profile.findUnique({ where: { slug } })) {
      slug = `${data.username.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${counter}`;
      counter++;
    }

    // ✅ PRIMEIRO profile => isActive=true; demais => isActive=false
    const isActive = count === 0;

    const profile = await this.prisma.profile.create({
      data: {
        userId: data.userId,
        username: data.username,
        slug,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        theme: data.theme ?? 'LIGHT',
        mainColor: data.mainColor,
        templateType: data.templateType,
        published: data.published ?? false,
        isActive,
      },
    });
    return {
      message: 'Perfil criado com sucesso!',
      profile: {
        id: profile.id,
        userId: profile.userId,
        username: profile.username,
        slug: profile.slug,
        theme: profile.theme,
        mainColor: profile.mainColor,
        templateType: profile.templateType,
        isActive: profile.isActive,
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
        slug: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        mainColor: true,
        templateType: true,
        published: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        linkButtons: {
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
        linkButtons: {
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

  async delete(id: string) {
    // Verifica se o perfil existe
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException(`Perfil com ID "${id}" não encontrado`);
    }

    // Delete cascata está configurado no schema do Prisma
    // Isso vai deletar automaticamente todos os registros relacionados
    await this.prisma.profile.delete({
      where: { id },
    });

    return {
      message: 'Perfil deletado com sucesso!',
    };
  }

  // ===== NOVOS MÉTODOS MULTI-PORTFOLIO =====

  async findByUserId(userId: string) {
    return this.prisma.profile.findMany({
      where: { userId },
      select: {
        id: true,
        slug: true,
        username: true,
        bio: true,
        avatarUrl: true,
        templateType: true,
        published: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { isActive: 'desc' }, // Ativo primeiro
        { createdAt: 'desc' }, // Mais recente depois
      ],
    });
  }

  async findBySlug(slug: string, previewToken?: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { slug },
      include: {
        legendas: true,
        social: {
          orderBy: { ordem: 'asc' },
        },
        config: true,
        projetos: {
          orderBy: { ordem: 'asc' },
        },
        linkButtons: {
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
      throw new NotFoundException(`Portfolio "${slug}" não encontrado`);
    }

    // ✅ Validação de preview token
    if (!profile.published) {
      if (!previewToken) {
        throw new ForbiddenException('Este portfolio não está publicado');
      }

      const validToken = await this.prisma.previewToken.findFirst({
        where: {
          profileId: profile.id,
          token: previewToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!validToken) {
        throw new UnauthorizedException(
          'Token de preview inválido ou expirado',
        );
      }
    }

    return profile;
  }

  async setActiveProfile(profileId: string, userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este portfolio',
      );
    }

    // ✅ TRANSACTION: desativa todos do user, ativa apenas o selecionado
    await this.prisma.$transaction([
      this.prisma.profile.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      this.prisma.profile.update({
        where: { id: profileId },
        data: { isActive: true },
      }),
    ]);

    return { message: 'Portfolio ativado com sucesso', profileId };
  }

  async duplicateProfile(
    sourceId: string,
    userId: string,
    dto: DuplicateProfileDto,
  ) {
    const source = await this.prisma.profile.findUnique({
      where: { id: sourceId },
      include: {
        legendas: true,
        social: true,
        projetos: true,
        linkButtons: true,
        config: true,
        techStack: { include: { technologies: true } },
        workHistory: {
          include: { technologies: true, responsibilities: true },
        },
        footer: true,
      },
    });

    if (!source || source.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    // Validar limite de 3
    const count = await this.prisma.profile.count({ where: { userId } });
    if (count >= 3) {
      throw new BadRequestException('Limite de 3 portfolios atingido');
    }

    // Validar se slug já existe
    const existingSlug = await this.prisma.profile.findUnique({
      where: { slug: dto.newSlug },
    });
    if (existingSlug) {
      throw new BadRequestException(`Slug "${dto.newSlug}" já está em uso`);
    }

    // Criar novo profile
    const newProfile = await this.prisma.profile.create({
      data: {
        userId,
        username: source.username,
        slug: dto.newSlug,
        bio: source.bio,
        avatarUrl: dto.copyMedia ? source.avatarUrl : null,
        theme: source.theme,
        mainColor: source.mainColor,
        templateType: source.templateType,
        templateSourceId: sourceId,
        published: false,
        isActive: false,
      },
    });

    // ✅ Copiar conteúdo se copyContent=true
    if (dto.copyContent) {
      // Legendas
      for (const leg of source.legendas) {
        await this.prisma.legenda.create({
          data: {
            profileId: newProfile.id,
            greeting: leg.greeting,
            legendaFoto: dto.copyMedia ? leg.legendaFoto : '', // String vazia ao invés de null
            nome: leg.nome,
            titulo: leg.titulo,
            subtitulo: leg.subtitulo,
            descricao: leg.descricao,
          },
        });
      }

      // Projetos
      for (const proj of source.projetos) {
        await this.prisma.projeto.create({
          data: {
            profileId: newProfile.id,
            nome: proj.nome,
            descricao: proj.descricao,
            demoLink: proj.demoLink,
            codeLink: proj.codeLink,
            ordem: proj.ordem,
            gif: dto.copyMedia ? proj.gif : null,
            tags: proj.tags,
          },
        });
      }

      // Social
      for (const soc of source.social) {
        await this.prisma.social.create({
          data: {
            profileId: newProfile.id,
            plataforma: soc.plataforma,
            url: soc.url,
            ordem: soc.ordem,
          },
        });
      }

      // Config
      if (source.config) {
        await this.prisma.config.create({
          data: {
            profileId: newProfile.id,
            stacks: source.config.stacks,
            projetos: source.config.projetos,
          },
        });
      }

      // TechStack
      if (source.techStack) {
        const newTechStack = await this.prisma.techStack.create({
          data: {
            profileId: newProfile.id,
            title: source.techStack.title,
            subtitle: source.techStack.subtitle,
          },
        });

        for (const tech of source.techStack.technologies) {
          await this.prisma.technology.create({
            data: {
              techStackId: newTechStack.id,
              name: tech.name,
              icon: tech.icon,
              color: tech.color,
              ordem: tech.ordem,
            },
          });
        }
      }

      // WorkHistory
      for (const work of source.workHistory) {
        const newWork = await this.prisma.workExperience.create({
          data: {
            profileId: newProfile.id,
            company: work.company,
            period: work.period,
            summary: work.summary,
            impact: work.impact,
            ordem: work.ordem,
          },
        });

        for (const tech of work.technologies) {
          await this.prisma.workTechnology.create({
            data: {
              workExperienceId: newWork.id,
              technology: tech.technology,
            },
          });
        }

        for (const resp of work.responsibilities) {
          await this.prisma.workResponsibility.create({
            data: {
              workExperienceId: newWork.id,
              responsibility: resp.responsibility,
              ordem: resp.ordem,
            },
          });
        }
      }

      // Footer
      if (source.footer) {
        await this.prisma.footer.create({
          data: {
            profileId: newProfile.id,
            title: source.footer.title,
            subtitle: source.footer.subtitle,
            email: source.footer.email,
            github: source.footer.github,
            linkedin: source.footer.linkedin,
            twitter: source.footer.twitter,
            copyrightName: source.footer.copyrightName,
            madeWith: source.footer.madeWith,
            resumeUrl: dto.copyMedia ? source.footer.resumeUrl : null,
          },
        });
      }
    }

    return newProfile;
  }

  async revokePreviewToken(profileId: string, token: string) {
    const deleted = await this.prisma.previewToken.deleteMany({
      where: { profileId, token },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Token não encontrado');
    }

    return { message: 'Token revogado com sucesso' };
  }
}
