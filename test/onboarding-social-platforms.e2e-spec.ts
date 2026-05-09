import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GoogleOAuthService } from 'src/auth/google-oauth/google-oauth.service';
import { PrismaService } from 'src/database/prisma.service';
import { bootstrapApp } from './helpers/app.helper';
import { cleanAll } from './helpers/db-cleaner';
import { createGoogleProfilePayload } from './helpers/factories';
import { loginWithGoogleSession } from './helpers/google-auth-session';

jest.setTimeout(30000);

const ONBOARDING_PLATFORM_LINKS = {
  instagram: '@creator',
  whatsapp: '+55 (11) 99999-9999',
  tiktok: 'tiktok.com/@creator',
  youtube: 'youtube.com/@creator',
  website: 'creator.example.com',
  spotify: 'open.spotify.com/user/creator',
  threads: '@creator',
  facebook: 'facebook.com/creator',
  x: '@creator',
  soundcloud: 'soundcloud.com/creator',
  snapchat: '@creator',
  pinterest: 'pinterest.com/creator',
  patreon: 'patreon.com/creator',
  twitch: 'twitch.tv/creator',
  applemusic: 'music.apple.com/profile/creator',
} as const;

const ONBOARDING_PLATFORM_IDS = Object.keys(ONBOARDING_PLATFORM_LINKS);

describe('Influencer onboarding social platform support (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let googleService: GoogleOAuthService;

  beforeAll(async () => {
    app = await bootstrapApp();
    prisma = app.get<PrismaService>(PrismaService);
    googleService = app.get<GoogleOAuthService>(GoogleOAuthService);

    await cleanAll(prisma);

    jest
      .spyOn(googleService, 'exchangeCodeForTokens')
      .mockResolvedValue({ idToken: 'fake', accessToken: 'fake' });
    jest
      .spyOn(googleService, 'verifyGoogleIdToken')
      .mockResolvedValue(createGoogleProfilePayload());
  });

  afterAll(async () => {
    await cleanAll(prisma);
    await app.close();
  });

  it('persists every platform accepted by influencer onboarding and skips out-of-scope platforms', async () => {
    const session = await loginWithGoogleSession(
      app,
      'onboarding-social-platforms-code',
    );
    const slug = `creator-${Date.now()}`;

    const response = await request(app.getHttpServer())
      .post('/onboarding/finalize')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({
        draftId: `draft-${Date.now()}`,
        templateType: 'template_04',
        slug,
        displayName: 'Creator Links',
        bio: 'Perfil com todas as redes do onboarding.',
        selectedPlatforms: [...ONBOARDING_PLATFORM_IDS, 'github'],
        platformLinks: {
          ...ONBOARDING_PLATFORM_LINKS,
          github: 'github.com/creator',
        },
        additionalLinks: [],
      })
      .expect(201);

    expect(response.body.skippedPlatforms).toEqual(['github']);

    const socials = await prisma.social.findMany({
      where: { profileId: response.body.profileId },
      orderBy: { ordem: 'asc' },
    });

    const storedPlatforms = socials.map((social) => social.plataforma);

    expect(socials).toHaveLength(ONBOARDING_PLATFORM_IDS.length);
    expect(storedPlatforms).toEqual(ONBOARDING_PLATFORM_IDS);
    expect(storedPlatforms).not.toContain('github');
    expect(socials.find((social) => social.plataforma === 'patreon')?.url).toBe(
      'https://patreon.com/creator',
    );
    expect(socials.find((social) => social.plataforma === 'twitch')?.url).toBe(
      'https://twitch.tv/creator',
    );
  });
});
