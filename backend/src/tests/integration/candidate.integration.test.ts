import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../index';

const prisma = new PrismaClient();

const buildPayload = (email: string) => ({
  firstName: 'Jane',
  lastName: 'Smith',
  email,
  phone: '+1 555 222 3333',
  address: '100 Integration Ave',
  educations: [
    {
      institution: 'State University',
      title: 'BSc Information Systems',
      startDate: '2018-01-01',
      endDate: '2022-01-01',
    },
  ],
  workExperiences: [
    {
      company: 'Acme Labs',
      position: 'Software Engineer',
      description: 'Delivered backend APIs',
      startDate: '2022-02-01',
      endDate: '2024-01-01',
    },
  ],
});

describe('Candidate API integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.candidate.deleteMany({
      where: {
        email: {
          contains: 'integration-test-',
        },
      },
    });
  });

  it('creates a candidate and persists nested education/work experience', async () => {
    const email = `integration-test-${Date.now()}@example.com`;

    const response = await request(app)
      .post('/candidates')
      .send(buildPayload(email));

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email,
      })
    );

    const saved = await prisma.candidate.findUnique({
      where: { email },
      include: { educations: true, workExperiences: true, resume: true },
    });

    expect(saved).not.toBeNull();
    expect(saved?.educations).toHaveLength(1);
    expect(saved?.workExperiences).toHaveLength(1);
  });

  it('returns 400 with structured validation details for invalid payload', async () => {
    const response = await request(app).post('/candidates').send({
      firstName: '',
      lastName: '',
      email: 'invalid-email',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.any(Array),
        }),
      })
    );
  });

  it('returns 409 duplicate email conflict', async () => {
    const email = `integration-test-${Date.now()}@example.com`;

    const first = await request(app).post('/candidates').send(buildPayload(email));
    expect(first.status).toBe(201);

    const second = await request(app).post('/candidates').send(buildPayload(email));
    expect(second.status).toBe(409);
    expect(second.body).toEqual(
      expect.objectContaining({
        statusCode: 409,
        error: expect.objectContaining({ code: 'DUPLICATE_EMAIL' }),
      })
    );
  });

  it('returns 400 when upload is missing file', async () => {
    const response = await request(app).post('/upload');

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      })
    );
  });

  it('returns 415 for unsupported upload type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('plain text content'), {
        filename: 'sample.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(415);
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 415,
        error: expect.objectContaining({ code: 'UNSUPPORTED_FILE_TYPE' }),
      })
    );
  });

  it('returns 413 for oversized upload', async () => {
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1, 'a');

    const response = await request(app)
      .post('/upload')
      .attach('file', oversized, {
        filename: 'large.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(413);
    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 413,
        error: expect.objectContaining({ code: 'FILE_TOO_LARGE' }),
      })
    );
  });
});
