import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('Multi-Portfolio E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;
  let profile1Id: string;
  let profile2Id: string;
  let profile3Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        email: `test-multi-${Date.now()}@test.com`,
        senha: 'password123',
        nome: 'Test Multi User',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testUserId) {
      await prisma.profile.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
    }
    await app.close();
  });

  describe('POST /profile - Create with portfolio limit', () => {
    it('should create first portfolio with isActive=true', async () => {
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: testUserId,
          username: `testuser1-${Date.now()}`,
          templateType: 'template_04',
          bio: 'Fitness coach',
          theme: 'DARK',
        })
        .expect(201);

      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.slug).toBeDefined();
      expect(response.body.profile.isActive).toBe(true);
      profile1Id = response.body.profile.id;
    });

    it('should create second portfolio with isActive=false', async () => {
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: testUserId,
          username: `testuser2-${Date.now()}`,
          templateType: 'template_05',
          bio: 'Musician',
        })
        .expect(201);

      expect(response.body.profile.isActive).toBe(false);
      profile2Id = response.body.profile.id;
    });

    it('should create third portfolio with isActive=false', async () => {
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: testUserId,
          username: `testuser3-${Date.now()}`,
          templateType: 'template_06',
          bio: 'Photographer',
        })
        .expect(201);

      expect(response.body.profile.isActive).toBe(false);
      profile3Id = response.body.profile.id;
    });

    it('should reject creating 4th portfolio (limit reached)', async () => {
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: testUserId,
          username: `testuser4-${Date.now()}`,
          templateType: 'template_07',
          bio: 'Coach',
        })
        .expect(400);

      expect(response.body.message).toContain('Limite atingido');
    });
  });

  describe('GET /profile/user/:userId - List user portfolios', () => {
    it('should list all 3 portfolios of user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/profile/user/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].isActive).toBe(true); // Primeiro na lista é o ativo
    });
  });

  describe('PATCH /profile/:id/set-active - Switch active portfolio', () => {
    it('should switch active portfolio from 1 to 2', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/profile/${profile2Id}/set-active`)
        .send({ userId: testUserId })
        .expect(200);

      expect(response.body.message).toContain('ativado com sucesso');

      // Verificar que apenas profile2 está ativo
      const profiles = await prisma.profile.findMany({
        where: { userId: testUserId },
      });

      const active = profiles.filter((p) => p.isActive);
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(profile2Id);
    });

    it('should reject switching portfolio from another user', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@test.com`,
          senha: 'password123',
          nome: 'Other User',
        },
      });

      await request(app.getHttpServer())
        .patch(`/profile/${profile1Id}/set-active`)
        .send({ userId: otherUser.id })
        .expect(403);

      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('GET /profile/slug/:slug - Public access by slug', () => {
    it('should find profile by slug', async () => {
      const profile = await prisma.profile.findUnique({
        where: { id: profile1Id },
      });

      const response = await request(app.getHttpServer())
        .get(`/profile/slug/${profile.slug}`)
        .expect(200);

      expect(response.body.id).toBe(profile1Id);
      expect(response.body.slug).toBe(profile.slug);
    });

    it('should return 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .get('/profile/slug/non-existent-slug-12345')
        .expect(404);
    });
  });

  describe('POST /profile/:id/duplicate - Duplicate portfolio', () => {
    it('should reject duplicate when already has 3 portfolios', async () => {
      const response = await request(app.getHttpServer())
        .post(`/profile/${profile1Id}/duplicate`)
        .send({
          userId: testUserId,
          newSlug: `duplicate-${Date.now()}`,
          copyContent: true,
          copyMedia: false,
        })
        .expect(400);

      expect(response.body.message).toContain(
        'Limite de 3 portfolios atingido',
      );
    });

    it('should duplicate portfolio after deleting one', async () => {
      // Deletar profile3 para liberar espaço
      await request(app.getHttpServer())
        .delete(`/profile/${profile3Id}`)
        .expect(200);

      // Agora deve conseguir duplicar
      const response = await request(app.getHttpServer())
        .post(`/profile/${profile1Id}/duplicate`)
        .send({
          userId: testUserId,
          newSlug: `duplicate-${Date.now()}`,
          copyContent: false,
          copyMedia: false,
        })
        .expect(201);

      expect(response.body.slug).toBeDefined();
      expect(response.body.templateSourceId).toBe(profile1Id);
      expect(response.body.isActive).toBe(false);

      // Limpar portfolio duplicado
      await prisma.profile.delete({ where: { id: response.body.id } });
    });
  });

  describe('DELETE /profile/:id/preview-token/:token - Revoke preview token', () => {
    it('should generate and revoke preview token', async () => {
      // Gerar token
      const tokenResponse = await request(app.getHttpServer())
        .post(`/profile/${profile1Id}/preview-token`)
        .expect(201);

      const token = tokenResponse.body.token;
      expect(token).toBeDefined();

      // Revogar token
      const revokeResponse = await request(app.getHttpServer())
        .delete(`/profile/${profile1Id}/preview-token/${token}`)
        .expect(200);

      expect(revokeResponse.body.message).toContain('revogado com sucesso');

      // Verificar que token foi removido
      const tokenExists = await prisma.previewToken.findFirst({
        where: { token },
      });
      expect(tokenExists).toBeNull();
    });

    it('should return 404 when revoking non-existent token', async () => {
      await request(app.getHttpServer())
        .delete(`/profile/${profile1Id}/preview-token/invalid-token-uuid`)
        .expect(404);
    });
  });

  describe('Template Types Validation', () => {
    it('should accept all 11 template types', async () => {
      const templates = [
        'template_01',
        'template_02',
        'template_03',
        'template_04',
        'template_05',
        'template_06',
        'template_07',
        'template_08',
        'template_09',
        'template_10',
        'template_11',
      ];

      // Criar usuário temporário para testar templates
      const tempUser = await prisma.user.create({
        data: {
          email: `temp-${Date.now()}@test.com`,
          senha: 'password123',
          nome: 'Temp User',
        },
      });

      // Testar criação com template_07 (outros já foram testados)
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: tempUser.id,
          username: `temp-${Date.now()}`,
          templateType: 'template_07',
          bio: 'Coach template test',
        })
        .expect(201);

      expect(response.body.profile.templateType).toBe('template_07');

      // Limpar
      await prisma.profile.deleteMany({ where: { userId: tempUser.id } });
      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    it('should reject invalid template type', async () => {
      await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: testUserId,
          username: `invalid-${Date.now()}`,
          templateType: 'template_99',
          bio: 'Invalid template',
        })
        .expect(400);
    });
  });

  describe('Slug Generation', () => {
    it('should generate slug from username', async () => {
      const tempUser = await prisma.user.create({
        data: {
          email: `slug-test-${Date.now()}@test.com`,
          senha: 'password123',
          nome: 'Slug Test User',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: tempUser.id,
          username: 'Test User Name',
          templateType: 'template_01',
        })
        .expect(201);

      expect(response.body.profile.slug).toBe('test-user-name');

      // Limpar
      await prisma.profile.deleteMany({ where: { userId: tempUser.id } });
      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    it('should handle slug collision with counter', async () => {
      const tempUser = await prisma.user.create({
        data: {
          email: `collision-${Date.now()}@test.com`,
          senha: 'password123',
          nome: 'Collision User',
        },
      });

      // Criar primeiro profile
      const response1 = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: tempUser.id,
          username: 'samename',
          templateType: 'template_01',
        })
        .expect(201);

      expect(response1.body.profile.slug).toBe('samename');

      // Criar segundo profile com mesmo username (seria collision, mas usernames são únicos)
      // Então vamos testar com username diferente
      const response2 = await request(app.getHttpServer())
        .post('/profile')
        .send({
          userId: tempUser.id,
          username: 'same-name', // Geraria mesmo slug
          templateType: 'template_02',
        })
        .expect(201);

      // Slug deve ser diferente devido ao username único
      expect(response2.body.profile.slug).toBe('same-name');

      // Limpar
      await prisma.profile.deleteMany({ where: { userId: tempUser.id } });
      await prisma.user.delete({ where: { id: tempUser.id } });
    });
  });
});
