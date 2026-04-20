import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleOAuthService } from 'src/auth/google-oauth/google-oauth.service';
import { bootstrapApp } from '../helpers/app.helper';
import { cleanAll } from '../helpers/db-cleaner';
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
    jest.clearAllMocks();
  });

  describe('GET /auth/google', () => {
    it('should return authorization URL and state cookie', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/google')
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('state');
      expect(response.body.url).toContain('accounts.google.com/o/oauth2');

      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();
      expect(
        setCookieHeaders.some((c: string) =>
          c.includes('bio4dev_google_oauth_state'),
        ),
      ).toBeTruthy();
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

    it('should authenticate user and return tokens when CSRF state matches', async () => {
      const stateId = 'fake-state-123';

      const response = await request(app.getHttpServer())
        .get(`/auth/google/callback?code=mock-code&state=${stateId}`)
        .set('Cookie', [`bio4dev_google_oauth_state=${stateId}`])
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).not.toHaveProperty('refreshToken'); // Refresh is HttpOnly cookie
      expect(response.body.user).toHaveProperty('email', mockProfile.email);
      expect(response.body.user).not.toHaveProperty('emailBcrypt');
      expect(response.body.user).not.toHaveProperty('emailIndex');

      const cookies = response.headers['set-cookie'];
      expect(
        cookies.some((c: string) => c.includes('refresh_token=')),
      ).toBeTruthy();

      // Double assertion: check Database
      const savedUser = await prisma.user.findUnique({
        where: { googleId: mockProfile.googleId },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.nome).toBe(mockProfile.name);
    });

    it('should throw 401 when CSRF state is missing or mismatched', async () => {
      // Missing cookie but query presents state
      await request(app.getHttpServer())
        .get('/auth/google/callback?code=mock-code&state=fake-state-123')
        .expect(401);

      // Mismatched state
      await request(app.getHttpServer())
        .get('/auth/google/callback?code=mock-code&state=fake-state-123')
        .set('Cookie', ['bio4dev_google_oauth_state=another-different-state'])
        .expect(401);
    });

    it('should apply rate limiting (Throttler) to stop bruteforce abuses', async () => {
      // 100 requests limit according to our app.module configuration
      // We will loop slightly above the limit

      const limit = 100;
      let lastStatus = 200;

      for (let i = 0; i < limit + 2; i++) {
        const res = await request(app.getHttpServer())
          .get('/auth/google/callback')
          // Missing code ensures it fails fast with 400 without running real logic
          .expect((res) => {
            // 400 bad request logic or 429 Too many requests
            if (res.status === 429) {
              lastStatus = 429;
            }
          });
      }

      expect(lastStatus).toBe(429); // 429 Too Many Requests was hit
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

      const stateId = 'initial-auth';
      const authRes = await request(app.getHttpServer())
        .get(`/auth/google/callback?code=mock-code&state=${stateId}`)
        .set('Cookie', [`bio4dev_google_oauth_state=${stateId}`]);

      accessToken = authRes.body.accessToken;
      validUserId = authRes.body.user.id;
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
