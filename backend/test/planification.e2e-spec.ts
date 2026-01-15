import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Technicien } from '../src/techniciens/entities/technicien.entity';
import { Tache, PrioriteTache, StatutTache } from '../src/taches/entities/tache.entity';
import { Affectation } from '../src/affectations/entities/affectation.entity';
import { Repository } from 'typeorm';

describe('Planification API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let technicienId: string;
  let tacheId: string;

  // Mock repositories pour les tests sans vraie base de données
  const mockTechnicienRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(dto => ({ id: 'mock-tech-id', ...dto })),
    save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'mock-tech-id', ...entity })),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockTacheRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(dto => ({ id: 'mock-tache-id', ...dto })),
    save: jest.fn().mockImplementation(entity => Promise.resolve({ id: 'mock-tache-id', ...entity })),
    remove: jest.fn().mockResolvedValue({}),
  };

  const mockAffectationRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(dto => ({ id: 'mock-aff-id', ...dto })),
    save: jest.fn().mockResolvedValue({}),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Technicien))
      .useValue(mockTechnicienRepo)
      .overrideProvider(getRepositoryToken(Tache))
      .useValue(mockTacheRepo)
      .overrideProvider(getRepositoryToken(Affectation))
      .useValue(mockAffectationRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('devrait retourner un token JWT avec des identifiants valides', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      authToken = response.body.access_token;
    });

    it('devrait rejeter des identifiants invalides', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('POST /api/planification/auto-assigner', () => {
    it('devrait rejeter une requête sans authentification', async () => {
      await request(app.getHttpServer())
        .post('/api/planification/auto-assigner')
        .send({ tacheId: 'some-uuid' })
        .expect(401);
    });

    it('devrait valider les données d\'entrée', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/planification/auto-assigner')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tacheId: 'invalid-uuid' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/planification/conflits', () => {
    it('devrait retourner la liste des conflits', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/planification/conflits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/planification/optimiser', () => {
    it('devrait lancer l\'optimisation globale', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/planification/optimiser')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.affectationsOptimisees).toBeDefined();
    });
  });
});
