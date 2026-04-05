import { CandidateValidator } from '../../application/validators/candidateValidator';

describe('CandidateValidator', () => {
  const validator = new CandidateValidator();

  describe('validatePersonalInfo', () => {
    it('returns no errors for valid personal info', () => {
      const errors = validator.validatePersonalInfo({
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'ana@example.com',
        phone: '+1 555-123-4567',
        address: '123 Main Street',
      });

      expect(errors).toEqual([]);
    });

    it('returns required field errors', () => {
      const errors = validator.validatePersonalInfo({
        firstName: '',
        lastName: '',
        email: '',
      });

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'firstName' }),
          expect.objectContaining({ field: 'lastName' }),
          expect.objectContaining({ field: 'email' }),
        ])
      );
    });

    it('returns invalid email and phone errors', () => {
      const errors = validator.validatePersonalInfo({
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'bad-email',
        phone: 'abc',
      });

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'phone' }),
        ])
      );
    });
  });

  describe('validateEducation', () => {
    it('returns no errors for valid education', () => {
      const errors = validator.validateEducation({
        institution: 'MIT',
        title: 'BSc Computer Science',
        startDate: '2020-01-01',
        endDate: '2022-01-01',
      });

      expect(errors).toEqual([]);
    });

    it('returns date range error when endDate is before startDate', () => {
      const errors = validator.validateEducation({
        institution: 'MIT',
        title: 'BSc',
        startDate: '2022-01-01',
        endDate: '2020-01-01',
      });

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'endDate' }),
        ])
      );
    });
  });

  describe('validateWorkExperience', () => {
    it('returns no errors for valid work experience', () => {
      const errors = validator.validateWorkExperience({
        company: 'Acme Corp',
        position: 'Engineer',
        description: 'Built APIs',
        startDate: '2021-01-01',
        endDate: '2022-01-01',
      });

      expect(errors).toEqual([]);
    });

    it('returns required field and date errors for invalid work experience', () => {
      const errors = validator.validateWorkExperience({
        company: '',
        position: '',
        description: '',
        startDate: 'invalid-date',
      });

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'company' }),
          expect.objectContaining({ field: 'position' }),
          expect.objectContaining({ field: 'description' }),
          expect.objectContaining({ field: 'startDate' }),
        ])
      );
    });
  });
});
