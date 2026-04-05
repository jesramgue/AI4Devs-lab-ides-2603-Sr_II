# Phase 2: Infrastructure & Form Structure

## Backend (BE-002, BE-003, BE-004)
Description: File storage setup, upload endpoint, validation utilities

Copy this prompt for your backend agent:

```text
You are a backend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: Node.js, Express.js, TypeScript, Prisma, PostgreSQL
Pattern: DDD with layered architecture, validators in application layer, upload infra in infrastructure layer

## Task: Phase 2 - Infrastructure (Backend)
Execute these tickets together:
1. BE-002: Set Up File Storage Configuration & Strategy
2. BE-003: Implement CV Upload Endpoint (POST /upload)
3. BE-004: Create Validation Utilities & Rules

### Deliverables

BE-002 File Storage
1. Create upload directory support and config:
   - Ensure backend/uploads exists at runtime
   - Add upload artifacts to backend/.gitignore (uploads and file patterns if needed)
2. Create backend/src/infrastructure/fileStorage.ts with a FileStorageService class:
   - uploadFile(file): persists file and returns path + metadata
   - deleteFile(filePath): removes file safely
   - validateFileSize(file, maxMb): enforces max size
   - validateMimeType(file, allowedMimeTypes): enforces allowed types
3. Read config from env with safe defaults:
   - UPLOAD_DIR=./uploads
   - MAX_FILE_SIZE_MB=10
   - ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document

BE-003 Upload Endpoint
1. Install dependencies if missing:
   - npm install multer
   - npm install -D @types/multer
2. Create upload controller at backend/src/presentation/controllers/uploadController.ts:
   - Method uploadFile(req, res)
   - Success response contains filePath, fileType, fileSize
   - Handle status codes:
     - 400 missing file
     - 413 file too large
     - 415 unsupported file type
3. Create upload routes at backend/src/routes/uploadRoutes.ts:
   - POST /upload using multer middleware
4. Register upload routes in backend/src/index.ts
5. Validate with curl:
   - curl -X POST http://localhost:3010/upload -F "file=@test.pdf"

BE-004 Validators + DTOs
1. Create backend/src/application/validators/candidateValidator.ts:
   - Class CandidateValidator
   - Validations for:
     - required fields
     - email format
     - phone format (if provided)
     - date rules (startDate <= endDate)
     - text length constraints
2. Create backend/src/application/dto/candidate.dto.ts:
   - CandidateDTO
   - CreateCandidatePayload
   - EducationInput
   - WorkExperienceInput
3. Optional tests if time allows:
   - backend/src/tests/validators.test.ts

### Validation Checklist
- [ ] POST /upload valid PDF returns success with filePath
- [ ] POST /upload unsupported type returns 415
- [ ] POST /upload file too large returns 413
- [ ] Uploaded file exists in uploads directory
- [ ] CandidateValidator can be instantiated and used
- [ ] npx tsc --noEmit passes
- [ ] npm run build passes

### Constraints
- Do not implement candidate creation endpoint yet (Phase 3)
- Keep business logic out of controllers
- Keep code fully typed and aligned with existing project standards

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/implementation-strategy.md
- ai-specs/changes/Backend_Implementation_Tickets.md
```

## Frontend (FE-002, FE-003, FE-004, FE-005)
Description: Personal info, dynamic education/work rows, CV upload section

Copy this prompt for your frontend agent:

```text
You are a frontend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: React 18, TypeScript, React Bootstrap
Pattern: Single AddCandidate form with modular section handlers and typed form state

## Task: Phase 2 - Infrastructure (Frontend)
Execute these tickets together:
1. FE-002: Build Personal Information Form Fields
2. FE-003: Implement Education Section with Dynamic Rows
3. FE-004: Implement Work Experience Section with Dynamic Rows
4. FE-005: Implement CV Upload Section

### Deliverables

FE-002 Personal Info
1. Update AddCandidate component with fields:
   - firstName, lastName, email, phone, address
2. Use typed state and controlled inputs
3. Ensure each input has id and each label has htmlFor

FE-003 Education Dynamic Rows
1. Add typed array state for educations:
   - institution, title, startDate, endDate
2. Add handlers:
   - addEducation()
   - removeEducation(index)
   - updateEducation(index, field, value)
3. UX rules:
   - remove disabled when only one row
   - cap rows at max 10

FE-004 Work Experience Dynamic Rows
1. Add typed array state for workExperiences:
   - company, position, description, startDate, endDate
2. Add handlers:
   - addExperience()
   - removeExperience(index)
   - updateExperience(index, field, value)
3. UX rules:
   - remove disabled when only one row
   - cap rows at max 10

FE-005 CV Upload Section
1. Add file input section with accept=.pdf,.docx
2. Track selected file in typed state
3. Show selected file metadata (name, size, type)
4. Add clear button to reset file state
5. Add client-side guards for file type/size presentation-level checks

### Validation Checklist
- [ ] Personal info fields render and are editable
- [ ] Education add/remove works with proper limits
- [ ] Work experience add/remove works with proper limits
- [ ] CV upload accepts PDF/DOCX and rejects unsupported types in UI
- [ ] No console errors during interactions
- [ ] npm run lint passes
- [ ] npm run build passes

### Constraints
- Do not implement API submission flow yet (Phase 3)
- Do not add full validation engine yet (Phase 3)
- Keep component typed and maintainable

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/implementation-strategy.md
- ai-specs/changes/Frontend_Implementation_Tickets.md
```

## Run Order
- Run backend and frontend prompts in parallel.
- After both finish, execute validation checklist.
- Then save checkpoint for Phase 2.
