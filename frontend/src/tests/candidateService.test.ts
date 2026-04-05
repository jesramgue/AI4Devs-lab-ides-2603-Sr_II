const mockPost = jest.fn();

export {};

beforeEach(() => {
  jest.resetModules();
  mockPost.mockReset();
});

const loadServiceModule = (): typeof import('../services/candidateService') => {
  jest.doMock('axios', () => ({
    __esModule: true,
    default: {
      create: jest.fn(() => ({ post: mockPost })),
    },
    create: jest.fn(() => ({ post: mockPost })),
  }));

  return require('../services/candidateService') as typeof import('../services/candidateService');
};

describe('candidateService', () => {
  it('uploads a CV using multipart form data', async () => {
    const { uploadCV } = loadServiceModule();
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });

    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          filePath: '/uploads/resume.pdf',
          fileType: file.type,
          fileSize: file.size,
        },
      },
    });

    const result = await uploadCV(file);

    expect(mockPost).toHaveBeenCalledWith(
      '/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
    expect(result).toEqual({
      filePath: '/uploads/resume.pdf',
      fileType: file.type,
      fileSize: file.size,
    });
  });

  it('creates a candidate with the expected payload', async () => {
    const { createCandidate } = loadServiceModule();
    const payload = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      educations: [
        {
          institution: 'Oxford',
          title: 'Mathematics',
          startDate: '2020-01-01',
        },
      ],
      workExperiences: [
        {
          company: 'Analytical Engines',
          position: 'Engineer',
          description: 'Built prototypes',
          startDate: '2021-01-01',
        },
      ],
    };

    mockPost.mockResolvedValue({ data: { success: true } });

    await createCandidate(payload);

    expect(mockPost).toHaveBeenCalledWith('/candidates', payload);
  });
});