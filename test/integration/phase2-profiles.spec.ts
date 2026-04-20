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

describe('Phase 2 - Profile Management & Security', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let googleService: GoogleOAuthService;

  let userA_Token: string;
  let userA_Id: string;
  let userB_Token: string;
  let userB_Id: string;

  beforeAll(async () => {
    app = await bootstrapApp();
    prisma = app.get<PrismaService>(PrismaService);
    googleService = app.get<GoogleOAuthService>(GoogleOAuthService);

    // Creates two test users to simulate attacks across boundaries
    async function setupUserAndGetTokens() {
      const googleProfile = createGoogleProfilePayload();
      jest
        .spyOn(googleService, 'exchangeCodeForTokens')
        .mockResolvedValue({ idToken: 'fake', accessToken: 'fake' });
      jest
        .spyOn(googleService, 'verifyGoogleIdToken')
        .mockResolvedValue(googleProfile);

      const session = await loginWithGoogleSession(app, 'mock');
      return { token: session.accessToken, id: session.user.id };
    }

    await cleanAll(prisma);
    const u1 = await setupUserAndGetTokens();
    const u2 = await setupUserAndGetTokens();

    userA_Token = u1.token;
    userA_Id = u1.id;
    userB_Token = u2.token;
    userB_Id = u2.id;
  });

  afterAll(async () => {
    await cleanAll(prisma);
    await app.close();
  });

  describe('Profile Creation (POST /profile)', () => {
    it('3.1 - Valid configuration (happy path)', async () => {
      const payload = createProfilePayload();

      const response = await request(app.getHttpServer())
        .post('/profile')
        .set('Authorization', `Bearer ${userA_Token}`)
        .send({
          ...payload,
          userId: userA_Id,
        })
        .expect(201);

      expect(response.body.profile).toHaveProperty('id');
      expect(response.body.profile.userId).toEqual(userA_Id);
      expect(response.body.profile.isActive).toBe(true);

      // Verify double check in database
      const count = await prisma.profile.count({ where: { userId: userA_Id } });
      expect(count).toBe(1);
    });

    it('3.2 - Max boundaries (limitation of 3 profiles)', async () => {
      // User A already has 1 profile (created above). Let's create two more to reach 3.
      await request(app.getHttpServer())
        .post('/profile')
        .set('Authorization', `Bearer ${userA_Token}`)
        .send({ ...createProfilePayload(), userId: userA_Id })
        .expect(201);

      await request(app.getHttpServer())
        .post('/profile')
        .set('Authorization', `Bearer ${userA_Token}`)
        .send({ ...createProfilePayload(), userId: userA_Id })
        .expect(201);

      // Verify db state
      let count = await prisma.profile.count({ where: { userId: userA_Id } });
      expect(count).toBe(3);

      // The 4th creation attempt must be blocked
      const failed = await request(app.getHttpServer())
        .post('/profile')
        .set('Authorization', `Bearer ${userA_Token}`)
        .send({ ...createProfilePayload(), userId: userA_Id })
        .expect(400);

      expect(failed.body.message).toContain('Limite atingido');

      count = await prisma.profile.count({ where: { userId: userA_Id } });
      expect(count).toBe(3); // Unchanged
    });

    it('3.3 - IDOR (Token of User B attacks to create profile for User A)', async () => {
      // User B tries to use their token, but injects User A's UUID as owner of the profile
      const failed = await request(app.getHttpServer())
        .post('/profile')
        .set('Authorization', `Bearer ${userB_Token}`)
        .send({
          ...createProfilePayload(),
          userId: userA_Id, // THE ATTACK
        })
        .expect(403);

      expect(failed.body.message).toContain('não tem permissão');
    });

    it('3.4 - Payload/Avatar Invalid Format (ValidationPipe block)', async () => {
      const failed = await request(app.getHttpServer())
        .post('/profile')
        .set('Authorization', `Bearer ${userB_Token}`)
        .send({
          userId: userB_Id,
          username: 'valid',
          slug: 'valid',
          avatarUrl: 'not-a-valid-url', // Fails @IsUrl()
          templateType: 'none', // Fails @IsEnum()
        })
        .expect(400);

      expect(Array.isArray(failed.body.message)).toBeTruthy();

      const count = await prisma.profile.count({ where: { userId: userB_Id } });
      expect(count).toBe(0); // Assures no partial creations occurred
    });
  });
});
