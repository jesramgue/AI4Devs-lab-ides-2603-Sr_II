import { Education, PersonalInfo, WorkExperience } from '../types/candidate.types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;

const validateRequiredText = (
  value: string,
  fieldLabel: string,
  maxLength: number,
): ValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldLabel} must be at most ${maxLength} characters.`,
    };
  }

  return { isValid: true };
};

export const validateFirstName = (value: string): ValidationResult =>
  validateRequiredText(value, 'First name', 255);

export const validateLastName = (value: string): ValidationResult =>
  validateRequiredText(value, 'Last name', 255);

export const validateEmail = (value: string): ValidationResult => {
  const requiredResult = validateRequiredText(value, 'Email', 255);

  if (!requiredResult.isValid) {
    return requiredResult;
  }

  if (!EMAIL_REGEX.test(value.trim())) {
    return {
      isValid: false,
      error: 'Email format is invalid.',
    };
  }

  return { isValid: true };
};

export const validatePhone = (value: string): ValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: true };
  }

  if (!PHONE_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone format is invalid.',
    };
  }

  return { isValid: true };
};

export const validateDateRange = (
  startDate: string,
  endDate: string,
): ValidationResult => {
  if (!startDate) {
    return {
      isValid: false,
      error: 'Start date is required.',
    };
  }

  if (!endDate) {
    return { isValid: true };
  }

  const startDateValue = new Date(startDate);
  const endDateValue = new Date(endDate);

  if (Number.isNaN(startDateValue.getTime()) || Number.isNaN(endDateValue.getTime())) {
    return {
      isValid: false,
      error: 'Date format is invalid.',
    };
  }

  if (endDateValue < startDateValue) {
    return {
      isValid: false,
      error: 'End date must be after or equal to start date.',
    };
  }

  return { isValid: true };
};

export const validatePersonalInfo = (
  personalInfo: PersonalInfo,
): Partial<Record<keyof PersonalInfo, string>> => {
  const errors: Partial<Record<keyof PersonalInfo, string>> = {};

  const firstNameValidation = validateFirstName(personalInfo.firstName);
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
  }

  const lastNameValidation = validateLastName(personalInfo.lastName);
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
  }

  const emailValidation = validateEmail(personalInfo.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const phoneValidation = validatePhone(personalInfo.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }

  if (personalInfo.address.trim().length > 500) {
    errors.address = 'Address must be at most 500 characters.';
  }

  return errors;
};

export const validateEducationRow = (
  education: Education,
): Partial<Record<keyof Education, string>> => {
  const errors: Partial<Record<keyof Education, string>> = {};

  const institutionValidation = validateRequiredText(education.institution, 'Institution', 255);
  if (!institutionValidation.isValid) {
    errors.institution = institutionValidation.error;
  }

  const titleValidation = validateRequiredText(education.title, 'Title', 255);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }

  const dateValidation = validateDateRange(education.startDate, education.endDate);
  if (!dateValidation.isValid) {
    if (!education.startDate) {
      errors.startDate = dateValidation.error;
    } else {
      errors.endDate = dateValidation.error;
    }
  }

  return errors;
};

export const validateWorkExperienceRow = (
  workExperience: WorkExperience,
): Partial<Record<keyof WorkExperience, string>> => {
  const errors: Partial<Record<keyof WorkExperience, string>> = {};

  const companyValidation = validateRequiredText(workExperience.company, 'Company', 255);
  if (!companyValidation.isValid) {
    errors.company = companyValidation.error;
  }

  const positionValidation = validateRequiredText(workExperience.position, 'Position', 255);
  if (!positionValidation.isValid) {
    errors.position = positionValidation.error;
  }

  const descriptionValidation = validateRequiredText(
    workExperience.description,
    'Description',
    2000,
  );
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error;
  }

  const dateValidation = validateDateRange(workExperience.startDate, workExperience.endDate);
  if (!dateValidation.isValid) {
    if (!workExperience.startDate) {
      errors.startDate = dateValidation.error;
    } else {
      errors.endDate = dateValidation.error;
    }
  }

  return errors;
};
