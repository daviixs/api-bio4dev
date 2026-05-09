import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, Profile } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  FinalizeOnboardingDto,
  FinalizeOnboardingResponseDto,
} from '../dto/onboarding.dto';
import { Plataforma } from '../dto/social.dto';

const DEFAULT_AVATAR_URL = 'https://api.dicebear.com/7.x/avataaars/svg';

const PLATFORM_SOCIAL_MAP: Record<string, Plataforma> = {
  instagram: Plataforma.instagram,
  whatsapp: Plataforma.whatsapp,
  tiktok: Plataforma.tiktok,
  youtube: Plataforma.youtube,
  website: Plataforma.website,
  spotify: Plataforma.spotify,
  threads: Plataforma.threads,
  facebook: Plataforma.facebook,
  x: Plataforma.x,
  soundcloud: Plataforma.soundcloud,
  snapchat: Plataforma.snapchat,
  pinterest: Plataforma.pinterest,
  patreon: Plataforma.patreon,
  twitch: Plataforma.twitch,
  applemusic: Plataforma.applemusic,
};

const SUPPORTED_SOCIAL_PLATFORMS = new Set<Plataforma>(
  Object.values(PLATFORM_SOCIAL_MAP),
);

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async finalize(
    authenticatedUserId: string,
    dto: FinalizeOnboardingDto,
  ): Promise<FinalizeOnboardingResponseDto> {
    const normalizedSlug = this.normalizeSlug(dto.slug);
    if (!normalizedSlug || !/^[a-z0-9-]{3,60}$/.test(normalizedSlug)) {
      throw new BadRequestException(
        'Slug inválido: use 3-60 caracteres, letras minúsculas, números e hífens',
      );
    }

    const templateType = dto.templateType || 'template_04';
    const displayName = dto.displayName.trim() || normalizedSlug;
    const bio = dto.bio?.trim() || '';
    const avatarUrl =
      this.normalizeExternalUrl(dto.avatarDataUrl) || DEFAULT_AVATAR_URL;

    return this.prisma.$transaction(async (tx) => {
      const profile = await this.createOrUpdateProfile(tx, {
        userId: authenticatedUserId,
        slug: normalizedSlug,
        displayName,
        templateType,
        bio,
        avatarUrl,
      });

      await this.upsertLegenda(tx, profile.id, {
        displayName,
        bio,
        avatarUrl,
      });

      const skippedPlatforms = await this.replaceSocials(tx, profile.id, dto);
      await this.replaceButtons(tx, profile.id, dto);

      return {
        profileId: profile.id,
        templateType: profile.templateType,
        redirectTo: '/dashboard',
        skippedPlatforms,
      };
    });
  }

  private async createOrUpdateProfile(
    tx: Prisma.TransactionClient,
    input: {
      userId: string;
      slug: string;
      displayName: string;
      templateType: string;
      bio: string;
      avatarUrl: string;
    },
  ) {
    const existingBySlug = await tx.profile.findUnique({
      where: { slug: input.slug },
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
          templateType: input.templateType as Profile['templateType'],
          published: false,
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
        templateType: input.templateType as Profile['templateType'],
        published: false,
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

    const base = (slug || 'perfil').slice(0, 34) || 'perfil';
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
      bio: string;
      avatarUrl: string;
    },
  ) {
    const existing = await tx.legenda.findFirst({
      where: { profileId },
      select: { id: true },
    });

    const data = {
      greeting: 'Ola, eu sou',
      legendaFoto: input.avatarUrl,
      nome: input.displayName,
      titulo: 'Criador de Conteudo',
      subtitulo: input.bio.slice(0, 255) || 'Criador de Conteudo',
      descricao: input.bio || 'Criador de Conteudo',
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
    dto: FinalizeOnboardingDto,
  ) {
    await tx.social.deleteMany({
      where: { profileId },
    });

    const selectedPlatforms = dto.selectedPlatforms || [];
    const platformLinks = dto.platformLinks || {};
    const skippedPlatforms = new Set<string>();
    const seenPlatforms = new Set<string>();
    const items: Array<{
      plataforma: Plataforma;
      url: string;
      ordem: number;
    }> = [];

    for (const platformId of selectedPlatforms) {
      if (!platformId || seenPlatforms.has(platformId)) {
        continue;
      }
      seenPlatforms.add(platformId);

      const mappedPlatform = PLATFORM_SOCIAL_MAP[platformId];

      if (!mappedPlatform || !SUPPORTED_SOCIAL_PLATFORMS.has(mappedPlatform)) {
        skippedPlatforms.add(platformId);
        continue;
      }

      const normalizedUrl = this.normalizeSocialUrl(
        platformId,
        platformLinks[platformId] || '',
      );

      if (!normalizedUrl) {
        continue;
      }

      items.push({
        plataforma: mappedPlatform,
        url: normalizedUrl,
        ordem: items.length,
      });
    }

    if (items.length > 0) {
      await tx.social.createMany({
        data: items.map((item) => ({
          profileId,
          plataforma: item.plataforma,
          url: item.url,
          ordem: item.ordem,
        })),
      });
    }

    return Array.from(skippedPlatforms);
  }

  private async replaceButtons(
    tx: Prisma.TransactionClient,
    profileId: string,
    dto: FinalizeOnboardingDto,
  ) {
    await tx.linkButton.deleteMany({
      where: { profileId },
    });

    const buttons = (dto.additionalLinks || [])
      .map((button) => ({
        label: button.label.trim(),
        url: this.normalizeExternalUrl(button.url),
      }))
      .filter((button) => button.label && button.url);

    if (buttons.length === 0) {
      return;
    }

    await tx.linkButton.createMany({
      data: buttons.map((button, index) => ({
        profileId,
        label: button.label,
        url: button.url,
        subtext: '',
        icon: 'link',
        style: 'primary',
        ordem: index,
        ativo: true,
      })),
    });
  }

  private normalizeSlug(input: string) {
    return input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private normalizeSocialUrl(platformId: string, value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    if (platformId === 'whatsapp') {
      const digits = trimmed.replace(/[^\d]/g, '');
      return digits ? `https://wa.me/${digits}` : '';
    }

    if (platformId === 'instagram') {
      const handle = trimmed.replace(/^@/, '');
      return handle ? `https://instagram.com/${handle}` : '';
    }

    if (platformId === 'x') {
      const handle = trimmed.replace(/^@/, '');
      return handle ? `https://x.com/${handle}` : '';
    }

    if (platformId === 'threads') {
      const handle = trimmed.replace(/^@/, '');
      return handle ? `https://www.threads.net/@${handle}` : '';
    }

    if (platformId === 'snapchat') {
      const handle = trimmed.replace(/^@/, '');
      return handle ? `https://www.snapchat.com/add/${handle}` : '';
    }

    return this.normalizeExternalUrl(trimmed) || '';
  }

  private normalizeExternalUrl(value?: string | null) {
    const trimmed = value?.trim();
    if (!trimmed) {
      return '';
    }

    if (/^(https?:\/\/|mailto:)/i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }
}
