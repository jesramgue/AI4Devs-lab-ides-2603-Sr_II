/**
 * Base class for all domain errors
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when request payload fails validation rules
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Thrown when a candidate with the same email already exists
 */
export class DuplicateEmailError extends DomainError {
  constructor(email?: string) {
    super(
      email
        ? `A candidate with email "${email}" already exists`
        : 'A candidate with this email already exists',
      'DUPLICATE_EMAIL',
      409
    );
  }
}

/**
 * Thrown when an uploaded file exceeds the maximum allowed size
 */
export class FileTooLargeError extends DomainError {
  constructor(maxMb: number) {
    super(
      `File size exceeds maximum of ${maxMb}MB`,
      'FILE_TOO_LARGE',
      413
    );
  }
}

/**
 * Thrown when an uploaded file type is not allowed
 */
export class UnsupportedFileTypeError extends DomainError {
  constructor(mimeType?: string) {
    super(
      mimeType
        ? `File type "${mimeType}" is not supported`
        : 'Unsupported file type',
      'UNSUPPORTED_FILE_TYPE',
      415
    );
  }
}

/**
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends DomainError {
  constructor(resource?: string) {
    super(
      resource ? `${resource} not found` : 'Resource not found',
      'NOT_FOUND',
      404
    );
  }
}
