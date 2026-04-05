import { CandidateService } from '../../application/services/candidateService';
import {
  DuplicateEmailError,
  ValidationError as DomainValidationError,
} from '../../domain/errors';

const buildPayload = () => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1 555 000 1234',
  address: '123 Main St',
  educations: [
    {
      institution: 'University',
      title: 'BSc',
      startDate: '2020-01-01',
      endDate: '2023-01-01',
    },
  ],
  workExperiences: [
    {
      company: 'Acme',
      position: 'Developer',
      description: 'Built APIs',
      startDate: '2023-02-01',
      endDate: '2024-01-01',
    },
  ],
  cvFilePath: 'resume.pdf',
  cvFileType: 'application/pdf',
  cvFileSize: 12345,
});

describe('CandidateService', () => {
  it('creates candidate successfully with sanitized data', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const payload = {
      ...buildPayload(),
      firstName: '  <b>John</b>  ',
      cvFilePath: '../unsafe/path/resume.pdf',
    };

    const tx = {
      candidate: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'cand_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1 555 000 1234',
          address: '123 Main St',
          createdAt,
          updatedAt: createdAt,
        }),
      },
      education: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      workExperience: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      resume: {
        create: jest.fn().mockResolvedValue({ id: 'resume_1' }),
      },
    };

    const prisma = {
      $transaction: jest.fn().mockImplementation(async (fn: any) => fn(tx)),
    } as any;

    const service = new CandidateService(prisma);
    const result = await service.createCandidate(payload);

    expect(result.id).toBe('cand_1');
    expect(tx.candidate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ firstName: 'John' }),
      })
    );
    expect(tx.resume.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ filePath: 'resume.pdf' }),
      })
    );
  });

  it('throws DomainValidationError for invalid payload', async () => {
    const prisma = {
      $transaction: jest.fn(),
    } as any;

    const service = new CandidateService(prisma);

    await expect(
      service.createCandidate({
        firstName: '',
        lastName: '',
        email: 'bad-email',
      })
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws DuplicateEmailError when email already exists', async () => {
    const tx = {
      candidate: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing' }),
        create: jest.fn(),
      },
      education: { createMany: jest.fn() },
      workExperience: { createMany: jest.fn() },
      resume: { create: jest.fn() },
    };

    const prisma = {
      $transaction: jest.fn().mockImplementation(async (fn: any) => fn(tx)),
    } as any;

    const service = new CandidateService(prisma);

    await expect(service.createCandidate(buildPayload())).rejects.toBeInstanceOf(
      DuplicateEmailError
    );
    expect(tx.candidate.create).not.toHaveBeenCalled();
  });

  it('propagates transaction failures (rollback expectation)', async () => {
    const tx = {
      candidate: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'cand_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: null,
          address: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      education: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      workExperience: {
        createMany: jest.fn().mockRejectedValue(new Error('DB failure')),
      },
      resume: { create: jest.fn() },
    };

    const prisma = {
      $transaction: jest.fn().mockImplementation(async (fn: any) => fn(tx)),
    } as any;

    const service = new CandidateService(prisma);

    await expect(service.createCandidate(buildPayload())).rejects.toThrow(
      'DB failure'
    );
  });
});
