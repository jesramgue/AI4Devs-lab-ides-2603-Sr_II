export interface ValidationError {
  field: string;
  message: string;
}

export class CandidateValidator {
  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (basic international format)
   */
  private static isValidPhone(phone: string): boolean {
    // Basic validation: 7-20 digits, plus signs, hyphens, spaces allowed
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate that startDate is before or equal to endDate
   */
  private static isValidDateRange(
    startDate: Date,
    endDate?: Date
  ): boolean {
    if (!endDate) return true;
    return startDate <= endDate;
  }

  /**
   * Validate text field length
   */
  private static isValidLength(
    text: string,
    minLength: number,
    maxLength: number
  ): boolean {
    const length = text.trim().length;
    return length >= minLength && length <= maxLength;
  }

  /**
   * Validate required string field
   */
  private static isValidRequired(value: any): boolean {
    return value !== undefined && value !== null && value.toString().trim() !== '';
  }

  /**
   * Validate candidate personal information
   */
  validatePersonalInfo(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    // First name validation
    if (!CandidateValidator.isValidRequired(data.firstName)) {
      errors.push({
        field: 'firstName',
        message: 'First name is required',
      });
    } else if (data.firstName && !CandidateValidator.isValidLength(data.firstName, 1, 255)) {
      errors.push({
        field: 'firstName',
        message: 'First name must be between 1 and 255 characters',
      });
    }

    // Last name validation
    if (!CandidateValidator.isValidRequired(data.lastName)) {
      errors.push({
        field: 'lastName',
        message: 'Last name is required',
      });
    } else if (data.lastName && !CandidateValidator.isValidLength(data.lastName, 1, 255)) {
      errors.push({
        field: 'lastName',
        message: 'Last name must be between 1 and 255 characters',
      });
    }

    // Email validation
    if (!CandidateValidator.isValidRequired(data.email)) {
      errors.push({
        field: 'email',
        message: 'Email is required',
      });
    } else if (data.email && !CandidateValidator.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Email format is invalid',
      });
    }

    // Phone validation (optional but must be valid if provided)
    if (
      data.phone &&
      !CandidateValidator.isValidPhone(data.phone)
    ) {
      errors.push({
        field: 'phone',
        message: 'Phone format is invalid',
      });
    }

    // Address validation (optional but must be reasonable length if provided)
    if (
      data.address &&
      !CandidateValidator.isValidLength(data.address, 1, 500)
    ) {
      errors.push({
        field: 'address',
        message: 'Address must be between 1 and 500 characters',
      });
    }

    return errors;
  }

  /**
   * Validate education entry
   */
  validateEducation(data: {
    institution?: string;
    title?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    // Institution validation
    if (!CandidateValidator.isValidRequired(data.institution)) {
      errors.push({
        field: 'institution',
        message: 'Institution is required',
      });
    } else if (data.institution && !CandidateValidator.isValidLength(data.institution, 1, 255)) {
      errors.push({
        field: 'institution',
        message: 'Institution name must be between 1 and 255 characters',
      });
    }

    // Title/Degree validation
    if (!CandidateValidator.isValidRequired(data.title)) {
      errors.push({
        field: 'title',
        message: 'Title/Degree is required',
      });
    } else if (data.title && !CandidateValidator.isValidLength(data.title, 1, 255)) {
      errors.push({
        field: 'title',
        message: 'Title must be between 1 and 255 characters',
      });
    }

    // Date validation
    try {
      const startDate = new Date(data.startDate || '');
      const endDate = data.endDate ? new Date(data.endDate) : undefined;

      if (isNaN(startDate.getTime())) {
        errors.push({
          field: 'startDate',
          message: 'Start date is invalid',
        });
      } else if (
        endDate &&
        !CandidateValidator.isValidDateRange(startDate, endDate)
      ) {
        errors.push({
          field: 'endDate',
          message: 'End date must be after or equal to start date',
        });
      }
    } catch {
      errors.push({
        field: 'startDate',
        message: 'Date format is invalid',
      });
    }

    return errors;
  }

  /**
   * Validate work experience entry
   */
  validateWorkExperience(data: {
    company?: string;
    position?: string;
    description?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    // Company validation
    if (!CandidateValidator.isValidRequired(data.company)) {
      errors.push({
        field: 'company',
        message: 'Company name is required',
      });
    } else if (data.company && !CandidateValidator.isValidLength(data.company, 1, 255)) {
      errors.push({
        field: 'company',
        message: 'Company name must be between 1 and 255 characters',
      });
    }

    // Position validation
    if (!CandidateValidator.isValidRequired(data.position)) {
      errors.push({
        field: 'position',
        message: 'Position is required',
      });
    } else if (data.position && !CandidateValidator.isValidLength(data.position, 1, 255)) {
      errors.push({
        field: 'position',
        message: 'Position must be between 1 and 255 characters',
      });
    }

    // Description validation
    if (!CandidateValidator.isValidRequired(data.description)) {
      errors.push({
        field: 'description',
        message: 'Description is required',
      });
    } else if (data.description && !CandidateValidator.isValidLength(data.description, 1, 2000)) {
      errors.push({
        field: 'description',
        message: 'Description must be between 1 and 2000 characters',
      });
    }

    // Date validation
    try {
      const startDate = new Date(data.startDate || '');
      const endDate = data.endDate ? new Date(data.endDate) : undefined;

      if (isNaN(startDate.getTime())) {
        errors.push({
          field: 'startDate',
          message: 'Start date is invalid',
        });
      } else if (
        endDate &&
        !CandidateValidator.isValidDateRange(startDate, endDate)
      ) {
        errors.push({
          field: 'endDate',
          message: 'End date must be after or equal to start date',
        });
      }
    } catch {
      errors.push({
        field: 'startDate',
        message: 'Date format is invalid',
      });
    }

    return errors;
  }
}
