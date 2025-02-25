import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule, RedisModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prismaService = app.get<PrismaService>(PrismaService);

    await prismaService.user.deleteMany({});
    await app.init();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({});
    await app.close();
  });


  describe('/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).not.toHaveProperty('password');
          userId = res.body.id;
        });
    });

    it('should not create a user with invalid data', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'pw'
        })
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).not.toHaveProperty('password');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    userId = 1;
    it('should return a user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 when user not found', () => {
      return request(app.getHttpServer())
        .get('/users/999')
        .expect(404);
    });
  });

  describe('/users/:id (PUT)', () => {
    userId = 1;
    it('should update a user by id', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('name', 'Updated Name');
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    userId = 1;
    it('should remove a user by id', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Usuário com ID 1 removido com sucesso');
        });
    });
  });


});
