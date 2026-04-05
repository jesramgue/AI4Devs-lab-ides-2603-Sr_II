import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import AddCandidate from '../components/AddCandidate/AddCandidate';
import { createCandidate, uploadCV } from '../services/candidateService';

jest.mock('../services/candidateService');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedUploadCV = uploadCV as jest.MockedFunction<typeof uploadCV>;
const mockedCreateCandidate = createCandidate as jest.MockedFunction<typeof createCandidate>;

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <AddCandidate />
    </MemoryRouter>,
  );

const fillRequiredFields = async (): Promise<void> => {
  await userEvent.type(screen.getByLabelText(/first name/i), 'Ada');
  await userEvent.type(screen.getByLabelText(/last name/i), 'Lovelace');
  await userEvent.type(screen.getByLabelText(/^email/i), 'ada@example.com');
  await userEvent.type(screen.getByLabelText(/institution/i), 'Oxford');
  await userEvent.type(screen.getByLabelText(/^title/i), 'Mathematics');

  const startDateFields = screen.getAllByLabelText(/start date/i);
  await userEvent.type(startDateFields[0], '2020-01-01');

  await userEvent.type(screen.getByLabelText(/company/i), 'Analytical Engines');
  await userEvent.type(screen.getByLabelText(/position/i), 'Engineer');
  await userEvent.type(screen.getByLabelText(/description/i), 'Built prototypes');
  await userEvent.type(startDateFields[1], '2021-01-01');
};

describe('AddCandidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUploadCV.mockResolvedValue({
      filePath: '/uploads/resume.pdf',
      fileType: 'application/pdf',
      fileSize: 128,
    });
    mockedCreateCandidate.mockResolvedValue({ success: true });
  });

  it('renders the expected sections and primary actions', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /add candidate/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /personal information/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /education/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /work experience/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /cv upload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit candidate/i })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are missing', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /submit candidate/i }));

    expect(screen.getByText(/please correct the highlighted fields before submitting/i)).toBeInTheDocument();
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/institution is required/i)).toBeInTheDocument();
    expect(screen.getByText(/company is required/i)).toBeInTheDocument();
  });

  it('adds and removes dynamic education and work experience rows', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /add education/i }));
    await userEvent.click(screen.getByRole('button', { name: /add experience/i }));

    expect(screen.getAllByLabelText(/institution/i)).toHaveLength(2);
    expect(screen.getAllByLabelText(/company/i)).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[1]);
    await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[1]);

    expect(screen.getAllByLabelText(/institution/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/company/i)).toHaveLength(1);
  });

  it('shows CV upload validation errors for unsupported files', async () => {
    renderComponent();

    const invalidFile = new File(['text'], 'resume.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload cv/i);

    await userEvent.upload(input, invalidFile);

    expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
    expect(mockedUploadCV).not.toHaveBeenCalled();
  });

  it('submits successfully and redirects after uploading a valid CV', async () => {
    renderComponent();

    await fillRequiredFields();
    await userEvent.upload(
      screen.getByLabelText(/upload cv/i),
      new File(['pdf'], 'resume.pdf', { type: 'application/pdf' }),
    );

    await userEvent.click(screen.getByRole('button', { name: /submit candidate/i }));

    await waitFor(() => {
      expect(mockedCreateCandidate).toHaveBeenCalledTimes(1);
    });

    expect(mockedUploadCV).toHaveBeenCalledTimes(1);
    expect(mockedCreateCandidate).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        cvFilePath: '/uploads/resume.pdf',
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/', {
      state: { successMessage: 'Candidate submitted successfully.' },
    });
  });

  it('shows a friendly error banner and preserves values when submission fails', async () => {
    renderComponent();

    mockedCreateCandidate.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
      },
    } as unknown as Error);

    await fillRequiredFields();
    await userEvent.click(screen.getByRole('button', { name: /submit candidate/i }));

    await waitFor(() => {
      expect(screen.getByText(/a candidate with this email already exists/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/first name/i)).toHaveValue('Ada');
    expect(screen.getByLabelText(/^email/i)).toHaveValue('ada@example.com');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});