import {
  validateDateRange,
  validateEducationRow,
  validateEmail,
  validatePersonalInfo,
  validatePhone,
  validateWorkExperienceRow,
} from '../utils/validationUtils';

describe('validationUtils', () => {
  it('accepts valid personal information', () => {
    expect(
      validatePersonalInfo({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '+1 555 555 5555',
        address: '42 Analytical Engine Street',
      }),
    ).toEqual({});
  });

  it('reports required and format errors for personal information', () => {
    expect(
      validatePersonalInfo({
        firstName: '',
        lastName: ' ',
        email: 'not-an-email',
        phone: 'abc',
        address: 'x'.repeat(501),
      }),
    ).toEqual({
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
      email: 'Email format is invalid.',
      phone: 'Phone format is invalid.',
      address: 'Address must be at most 500 characters.',
    });
  });

  it('validates email and phone edge cases', () => {
    expect(validateEmail('')).toEqual({ isValid: false, error: 'Email is required.' });
    expect(validateEmail('grace@example.com')).toEqual({ isValid: true });
    expect(validatePhone('')).toEqual({ isValid: true });
    expect(validatePhone('(555) 123-4567')).toEqual({ isValid: true });
  });

  it('validates date ranges', () => {
    expect(validateDateRange('', '2026-01-01')).toEqual({
      isValid: false,
      error: 'Start date is required.',
    });
    expect(validateDateRange('2026-01-02', '2026-01-01')).toEqual({
      isValid: false,
      error: 'End date must be after or equal to start date.',
    });
    expect(validateDateRange('2026-01-01', '2026-01-02')).toEqual({ isValid: true });
  });

  it('validates education rows', () => {
    expect(
      validateEducationRow({
        institution: '',
        title: '',
        startDate: '',
        endDate: '',
      }),
    ).toEqual({
      institution: 'Institution is required.',
      title: 'Title is required.',
      startDate: 'Start date is required.',
    });
  });

  it('validates work experience rows', () => {
    expect(
      validateWorkExperienceRow({
        company: '',
        position: '',
        description: '',
        startDate: '2026-02-01',
        endDate: '2026-01-01',
      }),
    ).toEqual({
      company: 'Company is required.',
      position: 'Position is required.',
      description: 'Description is required.',
      endDate: 'End date must be after or equal to start date.',
    });
  });
});