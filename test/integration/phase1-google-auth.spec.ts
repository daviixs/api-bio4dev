import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleOAuthService } from 'src/auth/google-oauth/google-oauth.service';
import { bootstrapApp } from '../helpers/app.helper';
import { cleanAll } from '../helpers/db-cleaner';
import {
  loginWithGoogleSession,
  startGoogleOAuthFlow,
} from '../helpers/google-auth-session';
import {
  createGoogleProfilePayload,
  createTamperedToken,
  createNoneAlgorithmToken,
} from '../helpers/factories';

describe('Phase 1 - Google OAuth & JWT Security', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let googleService: GoogleOAuthService;

  beforeAll(async () => {
    app = await bootstrapApp();
    prisma = app.get<PrismaService>(PrismaService);
    googleService = app.get<GoogleOAuthService>(GoogleOAuthService);

    await cleanAll(prisma);
  });

  afterAll(async () => {
    await cleanAll(prisma);
    await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google with a signed state and no transient handoff cookie', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/google')
        .expect(302);

      expect(response.headers.location).toContain(
        'accounts.google.com/o/oauth2',
      );
      expect(
        new URL(response.headers.location).searchParams.get('state'),
      ).toBeTruthy();

      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders ?? []).toHaveLength(0);
    });
  });

  describe('GET /auth/google/callback', () => {
    let mockProfile: ReturnType<typeof createGoogleProfilePayload>;

    beforeEach(async () => {
      await cleanAll(prisma);
      mockProfile = createGoogleProfilePayload();

      // Mocking Google Exchange so we don't hit external APIs
      jest.spyOn(googleService, 'exchangeCodeForTokens').mockResolvedValue({
        idToken: 'fake-id-token',
        accessToken: 'fake-access-token',
      });

      jest
        .spyOn(googleService, 'verifyGoogleIdToken')
        .mockResolvedValue(mockProfile);
    });

    it('should authenticate user, set session cookie, and redirect to frontend callback', async () => {
      const agent = request.agent(app.getHttpServer());
      const { state } = await startGoogleOAuthFlow(agent);

      const response = await agent
        .get(`/auth/google/callback?code=mock-code&state=${state}`)
        .expect(302);

      expect(response.headers.location).toContain(
        '/auth/callback/google?status=success',
      );

      const cookies = response.headers['set-cookie'];
      expect(
        cookies.some((c: string) => c.includes('refresh_token=')),
      ).toBeTruthy();

      const savedUser = await prisma.user.findUnique({
        where: { googleId: mockProfile.googleId },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.nome).toBe(mockProfile.name);
    });

    it('should ignore extra Google query params and still authenticate', async () => {
      const agent = request.agent(app.getHttpServer());
      const { state } = await startGoogleOAuthFlow(agent);

      const response = await agent
        .get(
          `/auth/google/callback?state=${state}&iss=${encodeURIComponent(
            'https://accounts.google.com',
          )}&code=mock-code&scope=${encodeURIComponent(
            'email profile openid',
          )}&authuser=0&prompt=consent`,
        )
        .expect(302);

      expect(response.headers.location).toContain(
        '/auth/callback/google?status=success',
      );
    });

    it('should redirect with error when CSRF state is missing or mismatched', async () => {
      await request(app.getHttpServer())
        .get('/auth/google/callback?code=mock-code&state=fake-state-123')
        .expect(302)
        .expect((response) => {
          expect(response.headers.location).toContain(
            '/auth/callback/google?status=error&reason=invalid_state',
          );
        });
    });

    it('should reject a tampered signed state', async () => {
      const agent = request.agent(app.getHttpServer());
      const { state } = await startGoogleOAuthFlow(agent);
      const tamperedState = `${state.slice(0, -1)}${state.endsWith('a') ? 'b' : 'a'}`;

      await agent
        .get(`/auth/google/callback?code=mock-code&state=${tamperedState}`)
        .expect(302)
        .expect((response) => {
          expect(response.headers.location).toContain(
            '/auth/callback/google?status=error&reason=invalid_state',
          );
        });
    });

    it('should reject an expired signed state', async () => {
      const initialNow = 1_700_000_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(initialNow);
      const agent = request.agent(app.getHttpServer());
      const { state } = await startGoogleOAuthFlow(agent);

      nowSpy.mockReturnValue(initialNow + 10 * 60 * 1000 + 1);

      await agent
        .get(`/auth/google/callback?code=mock-code&state=${state}`)
        .expect(302)
        .expect((response) => {
          expect(response.headers.location).toContain(
            '/auth/callback/google?status=error&reason=invalid_state',
          );
        });
    });

    it('should apply rate limiting (Throttler) to stop bruteforce abuses', async () => {
      const limit = 100;
      let lastStatus = 302;

      for (let i = 0; i < limit + 2; i++) {
        await request(app.getHttpServer())
          .get('/auth/google/callback')
          .expect((res) => {
            if (res.status === 429) {
              lastStatus = 429;
              return;
            }

            expect(res.status).toBe(302);
          });
      }

      expect(lastStatus).toBe(429);
    });
  });

  describe('Security Filters & JWT Edge Cases', () => {
    let accessToken: string;
    let validUserId: string;

    beforeEach(async () => {
      await cleanAll(prisma);
      const mockProfile = createGoogleProfilePayload();

      jest
        .spyOn(googleService, 'exchangeCodeForTokens')
        .mockResolvedValue({ idToken: 'fake', accessToken: 'fake' });
      jest
        .spyOn(googleService, 'verifyGoogleIdToken')
        .mockResolvedValue(mockProfile);

      const session = await loginWithGoogleSession(app);
      accessToken = session.accessToken;
      validUserId = session.user.id;
    });

    it('should accept valid access token for protected route', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should reject tampered token (signature invalid)', async () => {
      const tampered = createTamperedToken(
        accessToken,
        '00000000-0000-0000-0000-000000000000',
      );

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${tampered}`)
        .expect(401);
    });

    it('should reject algorithm "none" token completely', async () => {
      const noneToken = createNoneAlgorithmToken(validUserId);

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${noneToken}`)
        .expect(401);
    });
  });
});
