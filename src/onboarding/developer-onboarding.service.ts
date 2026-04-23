import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Profile } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  FinalizeDeveloperOnboardingDto,
  FinalizeDeveloperOnboardingResponseDto,
} from '../dto/developer-onboarding.dto';
import { Plataforma } from '../dto/social.dto';

const DEFAULT_AVATAR_URL =
  'https://api.dicebear.com/9.x/initials/svg?seed=Bio4Dev';
const SUPPORTED_SOCIAL_PLATFORMS = new Set<string>(Object.values(Plataforma));

@Injectable()
export class DeveloperOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async finalize(
    authenticatedUserId: string,
    dto: FinalizeDeveloperOnboardingDto,
  ): Promise<FinalizeDeveloperOnboardingResponseDto> {
    const normalizedSlug = this.normalizeSlug(dto.slug);
    if (!normalizedSlug || !/^[a-z0-9-]{3,60}$/.test(normalizedSlug)) {
      throw new BadRequestException(
        'Slug inválido: use 3-60 caracteres, letras minúsculas, números e hífens',
      );
    }

    const displayName = dto.displayName.trim() || normalizedSlug;
    const avatarUrl =
      this.normalizeUrl(dto.avatarUrl) ||
      this.normalizeUrl(dto.legenda?.legendaFoto) ||
      DEFAULT_AVATAR_URL;

    return this.prisma.$transaction(async (tx) => {
      const profile = await this.createOrUpdateProfile(tx, {
        userId: authenticatedUserId,
        slug: normalizedSlug,
        displayName,
        avatarUrl,
        templateType: dto.templateType,
        bio:
          dto.legenda?.descricao?.trim() ||
          dto.legenda?.subtitulo?.trim() ||
          `Perfil ${displayName}`,
      });

      await this.upsertLegenda(tx, profile.id, {
        displayName,
        avatarUrl,
        legenda: dto.legenda,
      });
      await this.replaceSocials(tx, profile.id, dto.social || []);
      await this.replaceProjects(tx, profile.id, dto.projetos || []);
      await this.upsertTechStack(tx, profile.id, dto.techStack);
      await this.replaceWorkHistory(tx, profile.id, dto.workHistory || []);
      await this.upsertFooter(tx, profile.id, displayName, dto.footer);

      return {
        profileId: profile.id,
        templateType: profile.templateType,
        redirectTo: '/dashboard',
      };
    });
  }

  private async createOrUpdateProfile(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      slug: string;
      displayName: string;
      avatarUrl: string;
      templateType: Profile['templateType'];
      bio: string;
    },
  ) {
    const existingBySlug = await tx.profile.findUnique({
      where: { slug: input.slug },
      select: { id: true, userId: true, username: true },
    });

    if (existingBySlug && existingBySlug.userId !== input.userId) {
      throw new ConflictException(`Slug "${input.slug}" já está em uso`);
    }

    if (existingBySlug) {
      return tx.profile.update({
        where: { id: existingBySlug.id },
        data: {
          bio: input.bio,
          avatarUrl: input.avatarUrl,
          templateType: input.templateType,
          published: true,
        },
      });
    }

    const count = await tx.profile.count({
      where: { userId: input.userId },
    });

    if (count >= 3) {
      throw new BadRequestException(
        'Limite atingido: você pode ter no máximo 3 portfolios. Exclua um para criar outro.',
      );
    }

    const username = await this.buildUniqueUsername(
      tx,
      input.displayName,
      input.slug,
    );

    return tx.profile.create({
      data: {
        userId: input.userId,
        username,
        slug: input.slug,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
        templateType: input.templateType,
        published: true,
        isActive: count === 0,
      },
    });
  }

  private async buildUniqueUsername(
    tx: Prisma.TransactionClient,
    displayName: string,
    slug: string,
  ) {
    const candidates = Array.from(
      new Set(
        [displayName.trim().slice(0, 40), slug.slice(0, 40)].filter(Boolean),
      ),
    );

    for (const candidate of candidates) {
      const existing = await tx.profile.findFirst({
        where: { username: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }

    const base = (slug || 'portfolio').slice(0, 34) || 'portfolio';
    for (let index = 1; index <= 50; index += 1) {
      const suffix = `-${index}`;
      const candidate = `${base.slice(0, 40 - suffix.length)}${suffix}`;
      const existing = await tx.profile.findFirst({
        where: { username: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new BadRequestException(
      'Não foi possível gerar um username único para o profile',
    );
  }

  private async upsertLegenda(
    tx: Prisma.TransactionClient,
    profileId: string,
    input: {
      displayName: string;
      avatarUrl: string;
      legenda?: FinalizeDeveloperOnboardingDto['legenda'];
    },
  ) {
    const existing = await tx.legenda.findFirst({
      where: { profileId },
      select: { id: true },
    });

    const data = {
      greeting: input.legenda?.greeting?.trim() || '',
      legendaFoto:
        this.normalizeUrl(input.legenda?.legendaFoto) || input.avatarUrl,
      nome: input.legenda?.nome?.trim() || input.displayName,
      titulo: input.legenda?.titulo?.trim() || 'Developer Portfolio',
      subtitulo:
        input.legenda?.subtitulo?.trim() ||
        input.legenda?.descricao?.trim().slice(0, 255) ||
        'Developer portfolio',
      descricao:
        input.legenda?.descricao?.trim() ||
        input.legenda?.subtitulo?.trim() ||
        'Developer portfolio',
    };

    if (existing) {
      await tx.legenda.update({
        where: { id: existing.id },
        data,
      });
      return;
    }

    await tx.legenda.create({
      data: {
        profileId,
        ...data,
      },
    });
  }

  private async replaceSocials(
    tx: Prisma.TransactionClient,
    profileId: string,
    social: FinalizeDeveloperOnboardingDto['social'],
  ) {
    await tx.social.deleteMany({
      where: { profileId },
    });

    const items = (social || [])
      .map((item, index) => {
        const plataforma = item.plataforma?.trim().toLowerCase();
        const url = this.normalizeUrl(item.url);

        if (
          !plataforma ||
          !SUPPORTED_SOCIAL_PLATFORMS.has(plataforma) ||
          !url
        ) {
          return null;
        }

        return {
          profileId,
          plataforma: plataforma as Plataforma,
          url,
          ordem: typeof item.ordem === 'number' ? item.ordem : index,
        };
      })
      .filter(Boolean) as Array<{
      profileId: string;
      plataforma: Plataforma;
      url: string;
      ordem: number;
    }>;

    if (items.length === 0) {
      return;
    }

    await tx.social.createMany({
      data: items,
    });
  }

  private async replaceProjects(
    tx: Prisma.TransactionClient,
    profileId: string,
    projetos: FinalizeDeveloperOnboardingDto['projetos'],
  ) {
    await tx.projeto.deleteMany({
      where: { profileId },
    });

    for (const [index, projeto] of (projetos || []).entries()) {
      const nome = projeto.nome?.trim();
      const descricao = projeto.descricao?.trim();

      if (!nome || !descricao) {
        continue;
      }

      await tx.projeto.create({
        data: {
          profileId,
          nome,
          descricao,
          demoLink: this.normalizeUrl(projeto.demoLink),
          codeLink: this.normalizeUrl(projeto.codeLink),
          gif: this.normalizeUrl(projeto.gif),
          ordem: typeof projeto.ordem === 'number' ? projeto.ordem : index,
          tags: (projeto.tags || []).map((item) => item.trim()).filter(Boolean),
        },
      });
    }
  }

  private async upsertTechStack(
    tx: Prisma.TransactionClient,
    profileId: string,
    techStack?: FinalizeDeveloperOnboardingDto['techStack'],
  ) {
    if (!techStack) {
      await tx.techStack.deleteMany({
        where: { profileId },
      });
      return;
    }

    const title = techStack.title?.trim() || 'Tech Stack';
    const subtitle =
      techStack.subtitle?.trim() || 'Tecnologias que uso no dia a dia';
    const technologies = (techStack.technologies || [])
      .map((item, index) => ({
        name: item.name?.trim(),
        icon: item.icon?.trim(),
        color: item.color?.trim() || 'text-slate-700',
        ordem: typeof item.ordem === 'number' ? item.ordem : index,
      }))
      .filter((item) => item.name && item.icon) as Array<{
      name: string;
      icon: string;
      color: string;
      ordem: number;
    }>;

    const existing = await tx.techStack.findUnique({
      where: { profileId },
      select: { id: true },
    });

    if (existing) {
      await tx.techStack.update({
        where: { profileId },
        data: {
          title,
          subtitle,
          technologies: {
            deleteMany: {},
            create: technologies,
          },
        },
      });
      return;
    }

    await tx.techStack.create({
      data: {
        profileId,
        title,
        subtitle,
        technologies: {
          create: technologies,
        },
      },
    });
  }

  private async replaceWorkHistory(
    tx: Prisma.TransactionClient,
    profileId: string,
    workHistory: FinalizeDeveloperOnboardingDto['workHistory'],
  ) {
    await tx.workExperience.deleteMany({
      where: { profileId },
    });

    for (const [index, item] of (workHistory || []).entries()) {
      const company = item.company?.trim();
      const period = item.period?.trim();
      const summary = item.summary?.trim();

      if (!company || !period || !summary) {
        continue;
      }

      await tx.workExperience.create({
        data: {
          profileId,
          company,
          period,
          summary,
          impact: item.impact?.trim() || undefined,
          ordem: typeof item.ordem === 'number' ? item.ordem : index,
          technologies: {
            create: (item.technologies || [])
              .map((tech) => tech.technology?.trim())
              .filter(Boolean)
              .map((technology) => ({ technology })),
          },
          responsibilities: {
            create: (item.responsibilities || [])
              .map((responsibility, responsibilityIndex) => ({
                responsibility: responsibility.responsibility?.trim(),
                ordem:
                  typeof responsibility.ordem === 'number'
                    ? responsibility.ordem
                    : responsibilityIndex,
              }))
              .filter((responsibility) => responsibility.responsibility),
          },
        },
      });
    }
  }

  private async upsertFooter(
    tx: Prisma.TransactionClient,
    profileId: string,
    displayName: string,
    footer?: FinalizeDeveloperOnboardingDto['footer'],
  ) {
    if (!footer) {
      await tx.footer.deleteMany({
        where: { profileId },
      });
      return;
    }

    const data = {
      title: footer.title?.trim() || 'Contact',
      subtitle: footer.subtitle?.trim() || 'Aberto para novas oportunidades',
      email: footer.email?.trim() || undefined,
      github: this.normalizeUrl(footer.github),
      linkedin: this.normalizeUrl(footer.linkedin),
      twitter: this.normalizeUrl(footer.twitter),
      copyrightName: footer.copyrightName?.trim() || displayName,
      madeWith: footer.madeWith?.trim() || 'Made with Bio4Dev',
      resumeUrl: this.normalizeUrl(footer.resumeUrl),
    };

    await tx.footer.upsert({
      where: { profileId },
      create: {
        profileId,
        ...data,
      },
      update: data,
    });
  }

  private normalizeSlug(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  private normalizeUrl(value?: string | null) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      return null;
    }

    if (trimmedValue.startsWith('mailto:')) {
      return trimmedValue;
    }

    const normalizedValue = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedValue)
      ? trimmedValue
      : `https://${trimmedValue}`;

    try {
      const parsedUrl = new URL(normalizedValue);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }

      return parsedUrl.toString();
    } catch {
      return null;
    }
  }
}
