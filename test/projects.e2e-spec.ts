import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserDto } from 'src/dto/users.dto';
import { CreateProfileDto, Colors } from 'src/dto/profiles.dto';
import { CreateProjetoDto } from 'src/dto/projects.dto';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let profileId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create a user
    const userDto: UserDto = {
      email: `testuser-${Date.now()}@test.com`,
      senha: 'password123',
      nome: 'Test User',
    };
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send(userDto);
    const userId = userResponse.body.id;

    // Create a profile for the user
    const profileDto: CreateProfileDto = {
      userId: userId,
      username: `testuser-${Date.now()}`,
      bio: 'Test bio',
      templateType: 'template_01',
      theme: Colors.LIGHT,
      mainColor: '#FFFFFF',
    };
    const profileResponse = await request(app.getHttpServer())
      .post('/profile')
      .send(profileDto);
    profileId = profileResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new project (POST /projects)', async () => {
    const projectDto: CreateProjetoDto = {
      profileId: profileId,
      nome: 'Test Project',
      descricao: 'This is a test project.',
      gif: 'https://example.com/test.gif',
      demoLink: 'https://example.com/demo',
      codeLink: 'https://github.com/test/test-project',
      ordem: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/projects')
      .send(projectDto)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.nome).toEqual(projectDto.nome);
    projectId = response.body.id;
  });

  it('should get all projects (GET /projects)', async () => {
    const response = await request(app.getHttpServer())
      .get('/projects')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should update a project (PATCH /projects/:id)', async () => {
    const updateDto = {
      nome: 'Updated Test Project',
    };

    const response = await request(app.getHttpServer())
      .patch(`/projects/${projectId}`)
      .send(updateDto)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.nome).toEqual(updateDto.nome);
  });

  it('should delete a project (DELETE /projects/:id)', async () => {
    await request(app.getHttpServer())
      .delete(`/projects/${projectId}`)
      .expect(200);
  });

  it('should not find the deleted project', async () => {
    const response = await request(app.getHttpServer()).get(`/projects`);
    const deletedProject = response.body.find((p) => p.id === projectId);
    expect(deletedProject).toBeUndefined();
  });
});
