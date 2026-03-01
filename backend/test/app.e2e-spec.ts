import request from 'supertest';
import { Server } from 'http';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
