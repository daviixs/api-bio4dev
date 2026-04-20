import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleOAuthService } from 'src/auth/google-oauth/google-oauth.service';
import { bootstrapApp } from '../helpers/app.helper';
import { cleanAll } from '../helpers/db-cleaner';
import { loginWithGoogleSession } from '../helpers/google-auth-session';
import {
  createGoogleProfilePayload,
  createProfilePayload,
} from '../helpers/factories';

// Increase timeout because this runs multiple HTTP requests chained sequentially
jest.setTimeout(30000);

describe('E2E Full Account Flow - Security & Consistency', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let googleService: GoogleOAuthService;

  // Global states for the chained flow
  let accessToken: string;
  let userId: string;
  let profileId: string;
  let targetSlug: string;

  const mockGoogleProfile = createGoogleProfilePayload();
  const mockProfile = createProfilePayload();

  beforeAll(async () => {
    app = await bootstrapApp();
    prisma = app.get<PrismaService>(PrismaService);
    googleService = app.get<GoogleOAuthService>(GoogleOAuthService);

    await cleanAll(prisma);

    // Mock Google Service methods so tests run locally detached from external networks
    jest
      .spyOn(googleService, 'exchangeCodeForTokens')
      .mockResolvedValue({ idToken: 'fake', accessToken: 'fake' });
    jest
      .spyOn(googleService, 'verifyGoogleIdToken')
      .mockResolvedValue(mockGoogleProfile);
  });

  afterAll(async () => {
    // Step 6 / Final - Cleanup Validation
    await cleanAll(prisma);

    const userCount = await prisma.user.count({ where: { id: userId } });
    const profileCount = await prisma.profile.count({
      where: { id: profileId },
    });

    expect(userCount).toBe(0);
    expect(profileCount).toBe(0);

    await app.close();
  });

  it('Step 1 & 2 - Registration & Login via Google Callback', async () => {
    const session = await loginWithGoogleSession(app, 'chained-flow-code');

    accessToken = session.accessToken;
    userId = session.user.id;

    expect(accessToken).toBeDefined();
    expect(userId).toBeDefined();
    expect(session.callbackResponse.headers.location).toContain(
      '/auth/callback/google?status=success',
    );
  });

  it('Step 3 - Creation of Profile with Bio', async () => {
    targetSlug = mockProfile.slug;

    const response = await request(app.getHttpServer())
      .post('/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...mockProfile,
        userId: userId,
      })
      .expect(201);

    profileId = response.body.profile.id;
    expect(profileId).toBeDefined();
  });

  it('Step 4 - Fetch generated Profile via Slug', async () => {
    const response = await request(app.getHttpServer())
      .get(`/profile/slug/${targetSlug}`)
      // .set('Authorization', `Bearer ${accessToken}`) - optional, route handles published state
      .expect(200);

    expect(response.body.slug).toEqual(targetSlug);
    expect(response.body.userId).toEqual(userId);
    expect(response.body.bio).toEqual(mockProfile.bio);
    expect(response.body.avatarUrl).toEqual(mockProfile.avatarUrl);

    // Ensure it does NOT link leaked user sensitive fields
    expect(response.body).not.toHaveProperty('emailBcrypt');
    expect(response.body).not.toHaveProperty('emailIndex');
    expect(response.body).not.toHaveProperty('emailMasked');
    expect(response.body.user).toBeUndefined(); // Should not eager load the internal User class
  });

  it('Step 5 - Consistency Validation on Prisma Service', async () => {
    // Checking Direct Database Integrity
    const directFetch = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    expect(directFetch).toBeDefined();
    if (directFetch) {
      expect(directFetch.bio).toBe(mockProfile.bio);
      expect(directFetch.avatarUrl).toBe(mockProfile.avatarUrl);
      expect(directFetch.userId).toBe(userId);
    }
  });

  // Step 6 logic happens in AfterAll
});
