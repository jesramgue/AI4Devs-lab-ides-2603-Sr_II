# Add Candidate Feature - Backend Implementation Tickets

## Overview
This document breaks down the backend work for the "Add Candidate" feature into atomic, single-purpose tickets. Each ticket represents **one logical unit of work** and accounts for **frontend dependencies** to enable parallel development where possible.

---

## BE-001: Extend Prisma Data Model for Candidate Entity

**Parent Story**: Add Candidate Feature  
**Type**: Foundation  
**Estimated Effort**: 2 hours  
**Blocks**: BE-003, BE-004, BE-005, FE-002, FE-003, FE-004, FE-008

### Description
Define and create the Prisma schema for Candidate, Education, WorkExperience, and CV/Resume entities with proper relationships, constraints, and validation rules.

### Technical Details

**Entities to Create in Prisma**:
- `Candidate` (main entity)
- `Education` (relation to Candidate)
- `WorkExperience` (relation to Candidate)
- `Resume` or `CandidateCV` (relation to Candidate)

**Schema Definition** (`backend/prisma/schema.prisma`):

```prisma
model Candidate {
  id            String      @id @default(cuid())
  firstName     String
  lastName      String
  email         String      @unique
  phone         String?
  address       String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  educations    Education[]
  workExperiences WorkExperience[]
  resume        Resume?
  
  @@map("candidates")
}

model Education {
  id            String      @id @default(cuid())
  institution   String
  title         String
  startDate     DateTime
  endDate       DateTime?
  candidateId   String
  candidate     Candidate   @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@map("educations")
  @@index([candidateId])
}

model WorkExperience {
  id            String      @id @default(cuid())
  company       String
  position      String
  description   String
  startDate     DateTime
  endDate       DateTime?
  candidateId   String
  candidate     Candidate   @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@map("work_experiences")
  @@index([candidateId])
}

model Resume {
  id            String      @id @default(cuid())
  filePath      String
  fileType      String      // MIME type: application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document
  fileSize      Int
  candidateId   String      @unique
  candidate     Candidate   @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  uploadedAt    DateTime    @default(now())
  
  @@map("resumes")
  @@index([candidateId])
}
```

**Constraints & Validations** (database level):
- Email: Unique, non-null
- FirstName, LastName: Non-null, max 255 chars
- Phone: Optional, max 20 chars
- Address: Optional, max 500 chars
- Education records: Max 3 per candidate (enforce in app logic)
- WorkExperience records: Max 10 per candidate (enforce in app logic)
- Resume: Optional, one per candidate

### Acceptance Criteria
1. ✅ Prisma schema includes all four entities (Candidate, Education, WorkExperience, Resume)
2. ✅ Relationships correctly defined with cascading deletes
3. ✅ Email uniqueness constraint enforced at database level
4. ✅ All required fields marked as non-null
5. ✅ Optional fields properly marked with `?`
6. ✅ Indices created for foreign key lookups (candidateId)
7. ✅ Schema compiles with no TypeScript errors
8. ✅ Tables properly named with `@@map` directives

### Definition of Done
- [ ] Schema file updated with all entities
- [ ] Schema validates and compiles
- [ ] Migration generated: `prisma migrate dev --name add_candidate_entities`
- [ ] Prisma client regenerated (types included)
- [ ] Code reviewed

---

## BE-002: Set Up File Storage Configuration & Strategy

**Parent Story**: Add Candidate Feature  
**Type**: Infrastructure  
**Estimated Effort**: 1.5 hours  
**Blocks**: BE-003 (Upload endpoint)

### Description
Define and configure file storage strategy for CV uploads, including directory structure, environment configuration, and file management utilities.

### Technical Details

**File Storage Approach**:
- **Location**: Store files outside public root (e.g., `/uploads` directory at project root or external storage)
- **Naming**: Use UUID or timestamp+random to avoid collisions
- **Access**: Serve via controlled endpoint (not directly from filesystem)
- **Security**: Restrict permissions to application user only

**Environment Configuration** (`backend/.env`):
```env
UPLOAD_DIR=/uploads
MAX_FILE_SIZE_MB=10
ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document
FILE_STORAGE_TYPE=local  # Can be 'local', 'aws-s3' for future scaling
```

**Create Utility Module** (`backend/src/infrastructure/fileStorage.ts`):
```typescript
interface FileUploadConfig {
  uploadDir: string;
  maxFileSizeMB: number;
  allowedMimeTypes: string[];
  storageType: 'local' | 's3'; // extensible for future
}

class FileStorageService {
  async uploadFile(file: File | Buffer, filename: string): Promise<{ filePath: string; fileType: string }>
  async deleteFile(filePath: string): Promise<void>
  async validateFileSize(sizeBytes: number): Promise<boolean>
  async validateMimeType(mimeType: string): Promise<boolean>
  getStoredFilePath(uuid: string): string
}
```

**Directory Structure**:
```
project-root/
├── uploads/          # Outside version control (add to .gitignore)
│   └── cv-{uuid}.{pdf|docx}
├── backend/
│   ├── src/
│   │   ├── infrastructure/
│   │   │   └── fileStorage.ts
│   │   └── ...
│   └── .gitignore    # Include: /uploads, *.pdf, *.docx
```

### Acceptance Criteria
1. ✅ Upload directory created and configured
2. ✅ `.gitignore` updated to exclude upload files
3. ✅ Environment variables defined and documented
4. ✅ FileStorageService utility created with core methods
5. ✅ MIME type validation configuration defined
6. ✅ File size limits enforced in code
7. ✅ No sensitive paths exposed in code

### Definition of Done
- [ ] Upload directory created
- [ ] .gitignore updated
- [ ] FileStorageService implemented
- [ ] Environment variables documented in `.env.example`
- [ ] Code reviewed

---

## BE-003: Implement CV Upload Endpoint (`POST /upload`)

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2.5 hours  
**Depends On**: BE-001, BE-002  
**Blocks**: FE-008 (API integration), BE-010 (integration tests)

### Description
Implement the `POST /upload` endpoint to handle CV file uploads with multipart form-data, validation, and error responses.

### Technical Details

**Endpoint Specification**:
- **Method**: `POST`
- **Path**: `/upload`
- **Content-Type**: `multipart/form-data`
- **Input**: File field named `file`

**Response Formats**:

Success (200):
```json
{
  "filePath": "/uploads/cv-550e8400-e29b-41d4-a716-446655440000.pdf",
  "fileType": "application/pdf"
}
```

Error Responses:
- `400` - Missing or malformed file field
- `413` - File exceeds 10 MB limit
- `415` - Unsupported MIME type
- `500` - Server error (e.g., disk full)

**Controller Implementation** (`backend/src/presentation/controllers/uploadController.ts`):
```typescript
export class UploadController {
  async uploadFile(req: Request, res: Response): Promise<void> {
    // 1. Validate file presence
    // 2. Validate file size
    // 3. Validate MIME type
    // 4. Generate unique filename
    // 5. Save file using FileStorageService
    // 6. Return filePath and fileType
    // 7. Handle and map errors
  }
}
```

**Route Registration** (`backend/src/routes/uploadRoutes.ts`):
```typescript
router.post('/upload', uploadController.uploadFile.bind(uploadController));
```

**Middleware Setup** (if using multer):
- Configure multer for multipart handling
- Set file size limits
- Set destination directory

### Acceptance Criteria
1. ✅ Endpoint accepts multipart/form-data with file field
2. ✅ Returns correct file path and MIME type on success
3. ✅ Validates file size (reject > 10 MB with 413 error)
4. ✅ Validates MIME type (reject unsupported with 415 error)
5. ✅ Returns 400 error if file field missing
6. ✅ File stored outside public root
7. ✅ Filename uses UUID to prevent collisions
8. ✅ Error responses follow standard error format

### Definition of Done
- [ ] Endpoint implemented with all validations
- [ ] Request/response tested with Postman or curl
- [ ] Error scenarios tested (missing file, oversized, wrong type)
- [ ] File saved correctly to disk
- [ ] No console errors or TypeScript issues
- [ ] Code reviewed

---

## BE-004: Create Validation Utilities & Rules

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2 hours  
**Depends On**: BE-001  
**Blocks**: BE-005 (service validation), FE-006 (mirrors client validation)

### Description
Implement server-side validation utilities for all Candidate form fields to ensure data integrity independent of frontend.

### Technical Details

**Validation Module** (`backend/src/application/validators/candidateValidator.ts`):

```typescript
interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string[]>;
}

export class CandidateValidator {
  // Personal Info Validation
  validateFirstName(firstName: any): ValidationResult
  validateLastName(lastName: any): ValidationResult
  validateEmail(email: any): ValidationResult
  validatePhone(phone: any): ValidationResult
  validateAddress(address: any): ValidationResult
  
  // Education Validation
  validateEducation(education: any): ValidationResult
  validateEducationArray(educations: any[]): ValidationResult
  
  // Work Experience Validation
  validateWorkExperience(experience: any): ValidationResult
  validateWorkExperienceArray(experiences: any[]): ValidationResult
  
  // Combined Validation
  validateCandidatePayload(payload: any): ValidationResult
}
```

**Validation Rules**:

**Personal Info**:
- `firstName`: Required, non-empty string, max 255 chars
- `lastName`: Required, non-empty string, max 255 chars
- `email`: Required, valid RFC 5322 email format, unique check against DB
- `phone`: Optional, valid international format if provided
- `address`: Optional, max 500 chars

**Education**:
- `institution`: Required, non-empty string, max 255 chars
- `title`: Required, non-empty string, max 255 chars
- `startDate`: Required, valid ISO 8601 date
- `endDate`: Optional, if provided must be >= startDate
- Max 3 education records per candidate

**Work Experience**:
- `company`: Required, non-empty string, max 255 chars
- `position`: Required, non-empty string, max 255 chars
- `description`: Required, non-empty string, max 1000 chars
- `startDate`: Required, valid ISO 8601 date
- `endDate`: Optional, if provided must be >= startDate
- Max 10 work experience records per candidate

**Implementation Approach**:
- Use validation library (joi, yup, or class-validator)
- Separate validators for each field type
- Return detailed error messages for debugging
- Handle edge cases (null values, empty arrays, date parsing)

### Acceptance Criteria
1. ✅ All validation rules implemented and testable
2. ✅ Returns structured error responses with field-level details
3. ✅ Validates email uniqueness against database
4. ✅ Enforces max/min constraints
5. ✅ Handles date validation correctly (ISO 8601, endDate >= startDate)
6. ✅ Enforces max 3 educations, max 10 work experiences
7. ✅ No false negatives (rejects invalid data) or false positives (accepts valid data)

### Definition of Done
- [ ] Validator module created
- [ ] All validation functions implemented
- [ ] Unit tests for validators passing (100% coverage)
- [ ] Edge cases handled
- [ ] Code reviewed

---

## BE-005: Implement Candidate Service (Business Logic)

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2.5 hours  
**Depends On**: BE-001, BE-004  
**Blocks**: BE-006 (controller), BE-010 (integration tests)

### Description
Create the Candidate service layer that orchestrates business logic: validation, record creation, error handling, and data transformation.

### Technical Details

**Service Class** (`backend/src/application/services/candidateService.ts`):

```typescript
export class CandidateService {
  constructor(
    private prisma: PrismaClient,
    private validator: CandidateValidator,
    private fileStorage: FileStorageService
  ) {}

  async createCandidateWithEducationAndExperience(
    payload: CreateCandidatePayload
  ): Promise<CandidateDTO> {
    // 1. Validate payload (use CandidateValidator)
    // 2. Check email uniqueness again (race condition protection)
    // 3. Create candidate record with nested education/work experience
    // 4. Attach resume metadata if CV provided
    // 5. Return created candidate (DTO format)
  }

  async getCandidate(id: string): Promise<CandidateDTO | null>
  async getCandidates(filters?: CandidateFilters): Promise<CandidateDTO[]>
  async updateCandidate(id: string, updates: UpdateCandidatePayload): Promise<CandidateDTO>
  async deleteCandidate(id: string): Promise<void>
}
```

**Data Transfer Objects** (`backend/src/application/dto/candidate.dto.ts`):

```typescript
export interface CandidateDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: EducationDTO[];
  workExperiences: WorkExperienceDTO[];
  resume?: ResumeDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: EducationInput[];
  workExperiences: WorkExperienceInput[];
  cv?: { filePath: string; fileType: string };
}
```

**Service Responsibilities**:
- Apply business rules (e.g., max educations, date validation)
- Orchestrate related entity creation (Education, WorkExperience, Resume)
- Transform Prisma models to DTOs for API responses
- Handle transactional operations (see BE-007)
- Throw domain-specific exceptions (not generic errors)

### Acceptance Criteria
1. ✅ Service uses CandidateValidator for all inputs
2. ✅ Creates candidate + related education/work experience in single operation
3. ✅ Returns candidate data in DTO format (clean API contract)
4. ✅ Handles duplicate email gracefully (throws specific error)
5. ✅ Transforms Prisma model to DTO correctly
6. ✅ No direct Prisma models exposed in API response
7. ✅ Service layer testable (dependencies injectable)

### Definition of Done
- [ ] CandidateService fully implemented
- [ ] DTOs defined for request/response
- [ ] Service uses validator before database operations
- [ ] Unit tests for service methods (happy path + errors)
- [ ] Integration with Prisma verified
- [ ] Code reviewed

---

## BE-006: Implement Candidate Controller & Route Handler

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2 hours  
**Depends On**: BE-005  
**Blocks**: BE-008 (error mapping), FE-008 (API integration)

### Description
Create the controller that handles HTTP requests, orchestrates service calls, and returns properly formatted responses.

### Technical Details

**Controller Class** (`backend/src/presentation/controllers/candidateController.ts`):

```typescript
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  async createCandidate(req: Request, res: Response): Promise<void> {
    // 1. Extract payload from req.body
    // 2. Call candidateService.createCandidateWithEducationAndExperience()
    // 3. Return 201 with created candidate data
    // 4. Handle errors (delegated to BE-008)
  }

  async getCandidate(req: Request, res: Response): Promise<void>
  async getCandidates(req: Request, res: Response): Promise<void>
  async updateCandidate(req: Request, res: Response): Promise<void>
  async deleteCandidate(req: Request, res: Response): Promise<void>
}
```

**Route Registration** (`backend/src/routes/candidateRoutes.ts`):

```typescript
router.post('/candidates', candidateController.createCandidate.bind(candidateController));
router.get('/candidates/:id', candidateController.getCandidate.bind(candidateController));
router.get('/candidates', candidateController.getCandidates.bind(candidateController));
router.put('/candidates/:id', candidateController.updateCandidate.bind(candidateController));
router.delete('/candidates/:id', candidateController.deleteCandidate.bind(candidateController));
```

**Request/Response Contract**:

Create Candidate Request:
```json
{
  "firstName": "Ana",
  "lastName": "Lopez",
  "email": "ana.lopez@example.com",
  "phone": "+34600111222",
  "address": "Madrid, Spain",
  "educations": [
    {
      "institution": "UCM",
      "title": "BSc Computer Science",
      "startDate": "2018-09-01T00:00:00.000Z",
      "endDate": "2022-06-30T00:00:00.000Z"
    }
  ],
  "workExperiences": [
    {
      "company": "Tech SA",
      "position": "Software Engineer",
      "description": "Backend APIs",
      "startDate": "2022-07-01T00:00:00.000Z",
      "endDate": null
    }
  ],
  "cv": {
    "filePath": "/uploads/cv-uuid.pdf",
    "fileType": "application/pdf"
  }
}
```

Create Candidate Response (201):
```json
{
  "id": "cuid123",
  "firstName": "Ana",
  "lastName": "Lopez",
  "email": "ana.lopez@example.com",
  "phone": "+34600111222",
  "address": "Madrid, Spain",
  "educations": [...],
  "workExperiences": [...],
  "resume": {...},
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Acceptance Criteria
1. ✅ Controller delegates to CandidateService
2. ✅ POST /candidates endpoint returns 201 on success
3. ✅ Response includes full candidate object with nested relations
4. ✅ Route handlers properly bound to controller context
5. ✅ All CRUD operations mapped to routes
6. ✅ Request/response payload matches API contract
7. ✅ No business logic in controller (only orchestration)

### Definition of Done
- [ ] CandidateController implemented
- [ ] Routes registered in main Express app
- [ ] POST /candidates endpoint tests passing
- [ ] Response schema validated
- [ ] Code reviewed

---

## BE-007: Implement Database Transaction for Candidate Creation

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 1.5 hours  
**Depends On**: BE-001, BE-005  
**Blocks**: None (internal quality)

### Description
Ensure atomic candidate creation: if any part fails (candidate, education, experience, resume), entire transaction rolls back with no partial records.

### Technical Details

**Transaction Implementation** (in CandidateService):

```typescript
async createCandidateWithEducationAndExperience(
  payload: CreateCandidatePayload
): Promise<CandidateDTO> {
  return this.prisma.$transaction(async (tx) => {
    // All operations within this block are transactional
    
    // 1. Create candidate record
    const candidate = await tx.candidate.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
      },
    });

    // 2. Create education records
    if (payload.educations.length > 0) {
      await tx.education.createMany({
        data: payload.educations.map(edu => ({
          ...edu,
          candidateId: candidate.id,
        })),
      });
    }

    // 3. Create work experience records
    if (payload.workExperiences.length > 0) {
      await tx.workExperience.createMany({
        data: payload.workExperiences.map(exp => ({
          ...exp,
          candidateId: candidate.id,
        })),
      });
    }

    // 4. Create resume record if provided
    if (payload.cv) {
      await tx.resume.create({
        data: {
          filePath: payload.cv.filePath,
          fileType: payload.cv.fileType,
          fileSize: 0, // placeholder; can be determined from file
          candidateId: candidate.id,
        },
      });
    }

    // Fetch complete candidate with all relations
    return tx.candidate.findUnique({
      where: { id: candidate.id },
      include: {
        educations: true,
        workExperiences: true,
        resume: true,
      },
    });
  });
}
```

**Error Handling**:
- Catch transaction errors
- Log error details (not sensitive data)
- Return user-friendly error message
- Ensure no orphaned records remain

### Acceptance Criteria
1. ✅ All candidate-related operations wrapped in transaction
2. ✅ Rollback occurs if any operation fails
3. ✅ No partial records created on failure
4. ✅ Transaction errors logged appropriately
5. ✅ User receives clear error message on rollback

### Definition of Done
- [ ] Transaction logic implemented
- [ ] Transaction tested (simulate failure in middle)
- [ ] Rollback verified (no partial records in DB)
- [ ] Unit tests for transaction behavior
- [ ] Code reviewed

---

## BE-008: Map Error Responses & Implement Standard Error Handling

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 2 hours  
**Depends On**: BE-003, BE-005, BE-006  
**Blocks**: FE-009 (error feedback depends on specific error codes)

### Description
Implement consistent error handling, HTTP status code mapping, and error response formatting across all endpoints.

### Technical Details

**Error Handling Strategy**:

**Custom Error Classes** (`backend/src/domain/errors/`):
```typescript
export class ValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super('Validation failed');
  }
}

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`Candidate with email ${email} already exists`);
  }
}

export class FileTooLargeError extends Error {
  constructor(sizeLimit: number) {
    super(`File exceeds maximum size of ${sizeLimit} MB`);
  }
}

export class UnsupportedFileTypeError extends Error {
  constructor(fileType: string) {
    super(`File type ${fileType} is not supported`);
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
  }
}
```

**Error Middleware** (`backend/src/middleware/errorHandler.ts`):

```typescript
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors,
    });
  } else if (err instanceof DuplicateEmailError) {
    res.status(409).json({
      statusCode: 409,
      message: err.message,
    });
  } else if (err instanceof FileTooLargeError) {
    res.status(413).json({
      statusCode: 413,
      message: err.message,
    });
  } else if (err instanceof UnsupportedFileTypeError) {
    res.status(415).json({
      statusCode: 415,
      message: err.message,
    });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({
      statusCode: 404,
      message: err.message,
    });
  } else {
    // Unexpected error
    res.status(500).json({
      statusCode: 500,
      message: 'An unexpected error occurred',
    });
  }
}
```

**HTTP Status Codes**:
- `201`: Candidate created successfully
- `200`: GET/PUT success
- `204`: DELETE success (no content)
- `400`: Validation failure (field-level errors included)
- `409`: Duplicate email conflict
- `413`: File too large (upload)
- `415`: Unsupported MIME type (upload)
- `404`: Resource not found
- `500`: Unexpected server error

**Standard Error Response Format**:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "firstName": ["First name is required"]
  }
}
```

### Acceptance Criteria
1. ✅ Custom error classes defined for each error type
2. ✅ Error middleware catches and maps errors to correct HTTP status codes
3. ✅ Validation errors return 400 with field-level details
4. ✅ Duplicate email returns 409 with clear message
5. ✅ File errors return 413 (too large) or 415 (unsupported type)
6. ✅ Unexpected errors return 500 with generic message (no sensitive data)
7. ✅ All error responses follow standard format
8. ✅ Error middleware registered in Express app

### Definition of Done
- [ ] Custom error classes created
- [ ] Error middleware implemented and registered
- [ ] All error scenarios tested (validation, duplicate, file, server errors)
- [ ] Error response contracts match API spec
- [ ] Code reviewed

---

## BE-009: Implement Security Validations & Input Sanitization

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 1.5 hours  
**Depends On**: BE-004, BE-006  
**Blocks**: None (internal security)

### Description
Implement server-side security measures: input sanitization, file validation, rate limiting, and prevention of common vulnerabilities.

### Technical Details

**Security Measures**:

1. **Input Sanitization**:
   - Trim whitespace from all string inputs
   - Remove special characters where not needed
   - Use parameterized queries (Prisma handles this)

2. **File Upload Security**:
   - Validate MIME type server-side (not just extension)
   - Check file magic numbers (file signatures)
   - Scan for malicious content if available
   - Store files outside public root
   - Set restrictive file permissions (owner read/write only)

3. **SQL Injection Prevention**:
   - Prisma parameterizes all queries (built-in protection)
   - Avoid raw SQL; use Prisma API

4. **Rate Limiting** (future):
   - Limit upload endpoint to prevent abuse
   - Limit candidate creation endpoint

5. **CORS & Headers**:
   - Set appropriate CORS headers
   - Set security headers (X-Content-Type-Options, X-Frame-Options, etc.)

**Implementation** (`backend/src/infrastructure/security.ts`):

```typescript
export class SecurityService {
  // Sanitize string input
  sanitizeString(input: string): string {
    return input.trim();
  }

  // Validate file MIME type
  validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  // Check file magic numbers (simplified)
  validateFileSignature(buffer: Buffer, expectedType: string): boolean {
    // PDF: FF D8 FF
    // DOCX: 50 4B 03 04 (ZIP archive)
    // implementation...
  }

  // Sanitize file path (prevent directory traversal)
  sanitizeFilePath(filePath: string): string {
    // Remove ../, ./, null bytes, etc.
  }
}
```

**Middleware for Security Headers** (`backend/src/middleware/securityHeaders.ts`):

```typescript
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
```

### Acceptance Criteria
1. ✅ All string inputs trimmed and sanitized
2. ✅ File MIME type validated server-side
3. ✅ File magic numbers checked
4. ✅ Files stored outside public root
5. ✅ No directory traversal attacks possible
6. ✅ Security headers set on all responses
7. ✅ No sensitive information logged

### Definition of Done
- [ ] Input sanitization implemented
- [ ] File security validations added
- [ ] Security headers middleware registered
- [ ] Security practices documented
- [ ] Code reviewed

---

## BE-010: Write Integration Tests for API Contracts

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 3 hours  
**Depends On**: BE-003, BE-006, BE-008  
**Blocks**: None (final validation)

### Description
Write integration tests for API endpoints covering success paths, error scenarios, and edge cases using Supertest and Jest.

### Technical Details

**Test File** (`backend/src/tests/integration/candidate.integration.test.ts`):

```typescript
describe('Candidate API Integration Tests', () => {
  describe('POST /candidates', () => {
    test('should create candidate successfully with all fields', async () => {
      const payload = { /* valid candidate data */ };
      const response = await request(app)
        .post('/candidates')
        .send(payload);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(payload.email);
    });

    test('should return 400 if first name is missing', async () => {
      const payload = { /* missing firstName */ };
      const response = await request(app)
        .post('/candidates')
        .send(payload);
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveProperty('firstName');
    });

    test('should return 409 if email already exists', async () => {
      // Create first candidate
      // Try to create second with same email
      // Expect 409 response
    });

    test('should create nested education records correctly', async () => {
      const payload = { /* with 3 educations */ };
      const response = await request(app)
        .post('/candidates')
        .send(payload);
      
      expect(response.status).toBe(201);
      expect(response.body.educations).toHaveLength(3);
    });

    test('should reject if more than 3 educations provided', async () => {
      const payload = { /* with 4 educations */ };
      const response = await request(app)
        .post('/candidates')
        .send(payload);
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /upload', () => {
    test('should upload PDF file successfully', async () => {
      const file = /* PDF file buffer */;
      const response = await request(app)
        .post('/upload')
        .attach('file', file, 'resume.pdf');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filePath');
    });

    test('should return 415 for unsupported file type', async () => {
      const file = /* .txt file */;
      const response = await request(app)
        .post('/upload')
        .attach('file', file, 'resume.txt');
      
      expect(response.status).toBe(415);
    });

    test('should return 413 if file exceeds 10 MB', async () => {
      const file = /* >10 MB file */;
      const response = await request(app)
        .post('/upload')
        .attach('file', file, 'large-resume.pdf');
      
      expect(response.status).toBe(413);
    });
  });

  describe('GET /candidates/:id', () => {
    test('should retrieve candidate with all relations', async () => {
      // Create candidate first
      // Query by ID
      // Verify all relations included
    });

    test('should return 404 if candidate not found', async () => {
      const response = await request(app)
        .get('/candidates/invalid-id');
      
      expect(response.status).toBe(404);
    });
  });
});
```

**Test Setup**:
- Use Jest for testing framework
- Use Supertest for HTTP request testing
- Mock database or use test database
- Clean up test data after each test

**Coverage Targets**:
- Happy path: candidate creation with full data
- Validation errors: missing fields, invalid formats, max limits
- File errors: unsupported type, too large
- Conflict: duplicate email
- Not found: invalid candidate ID
- Server errors: database errors, file system errors

### Acceptance Criteria
1. ✅ Integration tests for all API endpoints
2. ✅ Tests for success paths (201, 200)
3. ✅ Tests for error paths (400, 409, 413, 415, 404, 500)
4. ✅ Tests for file upload scenarios
5. ✅ Tests for nested relations (education, work experience)
6. ✅ All tests passing in CI
7. ✅ 80%+ code coverage for controller/service

### Definition of Done
- [ ] Integration test file created
- [ ] All test scenarios implemented
- [ ] Tests passing locally and in CI
- [ ] Coverage report generated
- [ ] Code reviewed

---

## BE-011: Write Unit Tests for Services & Validators

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 2.5 hours  
**Depends On**: BE-004, BE-005  
**Blocks**: None (final quality assurance)

### Description
Write unit tests for CandidateService and validation utilities with mocked dependencies and comprehensive edge case coverage.

### Technical Details

**Test Files**:

1. **Validator Unit Tests** (`backend/src/tests/unit/validators.test.ts`):
   - Test each validation function independently
   - Test valid inputs (should pass)
   - Test invalid inputs (should fail with specific error)
   - Test edge cases (empty strings, null values, max/min boundaries)

2. **Service Unit Tests** (`backend/src/tests/unit/candidateService.test.ts`):
   - Mock PrismaClient
   - Mock FileStorageService
   - Mock CandidateValidator
   - Test createCandidateWithEducationAndExperience:
     - Valid payload → creates and returns DTO
     - Invalid payload → throws ValidationError
     - Duplicate email → throws DuplicateEmailError
     - Database error → throws/handles appropriately
   - Test transaction behavior (rollback on failure)

**Test Example**:

```typescript
describe('CandidateValidator', () => {
  let validator: CandidateValidator;

  beforeEach(() => {
    validator = new CandidateValidator();
  });

  describe('validateEmail', () => {
    test('should pass for valid email', () => {
      const result = validator.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    test('should fail for invalid email format', () => {
      const result = validator.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should fail for empty string', () => {
      const result = validator.validateEmail('');
      expect(result.isValid).toBe(false);
    });

    test('should fail for null', () => {
      const result = validator.validateEmail(null);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateEducationArray', () => {
    test('should accept 1-3 education records', () => {
      const educations = [{ /* edu 1 */ }];
      const result = validator.validateEducationArray(educations);
      expect(result.isValid).toBe(true);
    });

    test('should reject more than 3 education records', () => {
      const educations = [{ /* 4 educations */ }];
      const result = validator.validateEducationArray(educations);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 3 education records allowed');
    });
  });
});

describe('CandidateService', () => {
  let service: CandidateService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockValidator: jest.Mocked<CandidateValidator>;

  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    mockValidator = createMockValidator();
    service = new CandidateService(mockPrisma, mockValidator);
  });

  describe('createCandidateWithEducationAndExperience', () => {
    test('should create candidate successfully', async () => {
      const payload = { /* valid payload */ };
      mockValidator.validateCandidatePayload.mockReturnValue({ isValid: true });
      mockPrisma.$transaction.mockResolvedValue({ /* created candidate */ });

      const result = await service.createCandidateWithEducationAndExperience(payload);

      expect(result).toHaveProperty('id');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    test('should throw ValidationError for invalid payload', async () => {
      const payload = { /* invalid */ };
      mockValidator.validateCandidatePayload.mockReturnValue({
        isValid: false,
        errors: { firstName: ['Required'] },
      });

      await expect(
        service.createCandidateWithEducationAndExperience(payload)
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### Acceptance Criteria
1. ✅ Unit tests for all validator functions
2. ✅ Unit tests for CandidateService methods
3. ✅ Mocked dependencies (Prisma, FileStorageService, Validator)
4. ✅ Tests for success scenarios
5. ✅ Tests for error scenarios
6. ✅ Edge cases tested (null, empty, boundary values)
7. ✅ 90%+ code coverage for validators and service
8. ✅ All tests passing

### Definition of Done
- [ ] Unit test files created
- [ ] All test scenarios implemented
- [ ] Dependencies properly mocked
- [ ] Tests passing locally and in CI
- [ ] Coverage report generated and reviewed
- [ ] Code reviewed

---

## Implementation Sequence & Dependencies

```
BE-001 (Data Model - Foundation)
  ├─ BE-002 (File Storage Config)
  │   └─ BE-003 (Upload Endpoint) ──┐
  │                                  ├─ BE-008 (Error Handling)
  ├─ BE-004 (Validation Utils)       │   ├─ FE-006 (mirrors client validation)
  │   └─ BE-005 (Service) ───────────┤   ├─ FE-008 (API integration)
  │       ├─ BE-007 (Transactions)   │   └─ FE-009 (error feedback)
  │       └─ BE-006 (Controller) ────┘
  │           ├─ BE-010 (Integration Tests)
  │           └─ BE-011 (Unit Tests)
  │
  ├─ BE-009 (Security)
  │   └─ (Final layer applied across services)
  │
  └─ BE-010 & BE-011 (Testing - parallel)
```

**Suggested Implementation Order**:

1. **Phase 1** (Foundation - Critical Path):
   - BE-001: Data model (BLOCKER for everything)
   - BE-004: Validation utilities (needed by service)

2. **Phase 2** (Core Logic - Parallel):
   - BE-002 + BE-003: File upload (parallel to service development)
   - BE-005: Service (uses BE-001, BE-004)
   - BE-006: Controller (uses BE-005)

3. **Phase 3** (Quality & Polish - Parallel):
   - BE-007: Transactions (refine BE-005)
   - BE-008: Error handling (enhance BE-003, BE-006)
   - BE-009: Security (apply to all layers)
   - BE-010 + BE-011: Testing (parallel, comprehensive)

---

## Frontend-Backend Dependency Map

```
FRONTEND TICKETS ↔ BACKEND TICKETS

FE-001 (Component scaffold)
  - No backend dependency (independent)

FE-002 (Personal info fields) ↔ BE-001 (Data model - types)
  - Frontend uses types from API contract
  
FE-003 (Education rows) ↔ BE-001 (Education entity)
  - Frontend mirrors Education data structure
  
FE-004 (Work experience rows) ↔ BE-001 (WorkExperience entity)
  - Frontend mirrors WorkExperience data structure

FE-005 (CV upload) ↔ BE-003 (POST /upload endpoint)
  - Frontend must wait for upload endpoint
  - BE-003 provides filePath that FE-005 needs

FE-006 (Validation) ↔ BE-004 (Validation rules)
  - Frontend and backend validation should mirror
  - Backend rules are source of truth
  - Types should match (from BE-001)

FE-008 (API integration) ↔ BE-006 (Controller + BE-008 Error handling)
  - Frontend must wait for:
    - BE-003: Upload endpoint
    - BE-006: Create candidate endpoint
    - BE-008: Error response formats

FE-009 (Error feedback) ↔ BE-008 (Error mapping)
  - Frontend needs specific HTTP status codes:
    - 400: Validation errors (field-level)
    - 409: Duplicate email
    - 413: File too large
    - 415: Unsupported file type
  - BE-008 provides consistent error format

FE-010 (Dashboard CTA) ↔ BE-001 (implicit)
  - Links to FE-001 component
  - No backend dependency

FE-011 (Tests) ↔ BE-010, BE-011 (API contract stability)
  - Both have integration/contract tests
  - Coordinated testing ensures compatibility
```

**Critical Path Blocking**:
- **BE-001 is the primary blocker** - All other backend work can proceed once schema is defined
- **BE-003 & BE-006 must complete before FE-008** - Frontend integration depends on working endpoints
- **BE-008 must complete before FE-009** - Specific error response formats needed for error handling

---

## Parallel Development Strategy

**Week 1**:
- **Backend**: BE-001, BE-004 (foundation work)
- **Frontend**: FE-001 (component scaffold - independent)

**Week 2**:
- **Backend**: BE-002, BE-003, BE-005, BE-006 (core endpoints + service)
- **Frontend**: FE-002, FE-003, FE-004, FE-005 (form sections in parallel)

**Week 3**:
- **Backend**: BE-007, BE-008, BE-009 (quality + security polish)
- **Frontend**: FE-006, FE-007 (validation + accessibility)
- **Integration**: BE-010 (integration tests validate API contract)

**Week 4**:
- **Backend**: BE-010, BE-011 (comprehensive testing)
- **Frontend**: FE-008, FE-009 (API integration + error handling)
- **Integration**: FE-011 (end-to-end tests + final validation)

**Week 5**:
- **Frontend**: FE-010 (dashboard CTA)
- **Final**: Code reviews, bug fixes, documentation updates

---

## Notes for Backend Developers

### Code Organization
- Follow domain-driven design (entities in `domain/`, services in `application/`, controllers in `presentation/`)
- Keep validations in dedicated utilities (`validators/`)
- Extract error classes to `domain/errors/`
- Use dependency injection for testability

### Database Best Practices
- Use Prisma transactions for atomic operations
- Include indices on foreign keys and frequently queried fields
- Cascade delete for related entities (education, work experience, resume)
- Validate constraints at both database and application layer

### API Design
- Use DTOs to decouple API responses from database models
- Return consistent error formats
- Include full nested relations in responses when appropriate
- Avoid N+1 queries (use `include` in Prisma)

### Security Checklist
- [ ] All inputs validated server-side
- [ ] Files scanned/validated before storage
- [ ] No sensitive data in logs or responses
- [ ] Parameterized queries used (Prisma handles this)
- [ ] File permissions restricted (owner only)
- [ ] Security headers set
- [ ] Rate limiting implemented (if time permits)

### Testing Strategy
- Unit tests for validation and business logic (90%+ coverage)
- Integration tests for API endpoints (test request/response contracts)
- Mock external dependencies (file storage, database)
- Test error scenarios as rigorously as happy paths

