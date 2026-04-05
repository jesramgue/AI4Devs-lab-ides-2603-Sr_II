# Add Candidate Feature - Implementation Plan

## TL;DR
**Goal:** Build the "Add Candidate" feature end-to-end incrementally.  
**Duration:** 5 phases spanning ~2 weeks of development.  
**Approach:** Foundation → Core Features → Integration → Quality → Polish.  
**Validation:** User reviews each checkpoint before proceeding to next phase.  
**Rollback:** Each phase checkpoint is tagged in git; easy to revert if needed.

---

## Phase Overview

| Phase | Duration | Backend Work | Frontend Work | Validation |
|-------|----------|--------------|---------------|------------|
| **1. Foundation** | Days 1-1.5 | BE-001 (Prisma model) | FE-001 (types, scaffold) + deps | DB schema migrates, components render |
| **2. Infrastructure** | Days 2-2.5 | BE-002, BE-003, BE-004 | FE-002, FE-003, FE-004, FE-005 | Upload endpoint works, form sections interactive |
| **3. Core Logic** | Days 3-3.5 | BE-005, BE-006, BE-007 | FE-006, FE-008 | Create endpoint works, form can submit |
| **4. Quality & UX** | Days 4-4.5 | BE-008, BE-009 | FE-007, FE-009, FE-010 | Errors display cleanly, a11y passes, nav works |
| **5. Testing & Polish** | Days 5+ | BE-010, BE-011 | FE-011 + final review | 90%+ coverage, docs updated |

---

## PHASE 1: Foundation (Days 1–1.5)

### Goal
Set up data model, project types, dependencies so all subsequent work is unblocked.

### Backend Tasks (BE-001)
**Ticket:** `BE-001: Extend Prisma Data Model for Candidate Entity` (2 hours)

**Specialist:** backend_developer

**Steps:**

1. **Extend the Prisma schema** → `backend/prisma/schema.prisma`
   - Add `Candidate`, `Education`, `WorkExperience`, `Resume` models
   - Define relationships (one-to-many with cascading deletes)
   - Add constraints (email unique, createdAt/updatedAt timestamps)
   - Reference: `Backend_Implementation_Tickets.md` → BE-001 schema section

2. **Run migration**
   ```bash
   cd backend
   npx prisma migrate dev --name add_candidate_entities
   ```

3. **Generate types**
   ```bash
   npx prisma generate
   ```

4. **Verify**
   - No TypeScript errors: `npx tsc --noEmit`
   - Prisma client types generated in `node_modules/@prisma/client`

### Frontend Tasks (FE-001 + Dependencies)
**Ticket:** `FE-001: Create AddCandidate Component Structure & Type Definitions` (2 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Install missing dependencies**
   ```bash
   cd frontend
   npm install react-router-dom@6.23.1
   npm install react-bootstrap@2.10.2 bootstrap@5.3.x
   npm install axios
   ```

2. **Create type definitions** → `frontend/src/types/candidate.types.ts`
   - Export interfaces: `PersonalInfo`, `Education`, `WorkExperience`, `CVFile`, `CandidateFormData`
   - Reference: `Frontend_Implementation_Tickets.md` → FE-001 types section

3. **Create component scaffold** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - Functional component with `React.FC` typing
   - Empty state (just renders a form tag)
   - Basic imports setup

4. **Verify**
   - No lint errors: `npm run lint` or `npx eslint src/`
   - No TypeScript errors: `npx tsc --noEmit`
   - Component can be imported and renders without errors in dev: `npm start`

### Validation Checkpoint (User Reviews)
**Before proceeding, verify:**
- [ ] Backend: `prisma migrate dev --name add_candidate_entities` runs successfully
- [ ] Backend: `npx prisma studio` can browse `candidates`, `educations`, `workExperiences`, `resumes` tables
- [ ] Frontend: `npm start` runs without errors; no missing module warnings
- [ ] Frontend: Component can be imported in `App.tsx` and renders without crashing

**Rollback Strategy:**
```bash
# If Prisma migration succeeded but schema is wrong:
cd backend
npx prisma migrate resolve --rolled-back add_candidate_entities
# Edit schema.prisma and re-run migration

# If dependencies broke, reinstall:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Save Progress:**
```bash
git add -A
git commit -m "[CHECKPOINT] Phase 1: Data model and scaffolds in place"
git tag phase-1-foundation
```

---

## PHASE 2: Infrastructure & Form Structure (Days 2–2.5)

### Goal
Build file upload infrastructure, form sections (personal info, education, work exp), and validation utilities.

### Backend Tasks (BE-002, BE-003, BE-004)

**Ticket:** `BE-002: Set Up File Storage Configuration & Strategy` (1.5 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create directory structure**
   ```bash
   cd backend
   mkdir -p src/infrastructure
   mkdir -p src/application/validators
   mkdir -p uploads
   ```

2. **Update .gitignore** → `backend/.gitignore`
   - Add: `/uploads`, `*.pdf`, `*.docx`

3. **Create FileStorageService** → `backend/src/infrastructure/fileStorage.ts`
   - Methods: `uploadFile()`, `deleteFile()`, `validateFileSize()`, `validateMimeType()`
   - Config: Use `process.env.UPLOAD_DIR`, `MAX_FILE_SIZE_MB`, `ALLOWED_MIME_TYPES`

4. **Update .env** → `backend/.env`
   ```env
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=10
   ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document
   FILE_STORAGE_TYPE=local
   ```

5. **Verify**
   - `uploads/` directory exists and is writable
   - No errors importing FileStorageService: `npx tsc --noEmit`

**Ticket:** `BE-003: Implement CV Upload Endpoint (POST /upload)` (2.5 hours)

**Specialist:** backend_developer

**Steps:**

1. **Install multer** (if not already in package.json)
   ```bash
   npm install multer
   npm install @types/multer --save-dev
   ```

2. **Create upload controller** → `backend/src/presentation/controllers/uploadController.ts`
   - Method: `uploadFile(req, res)` 
   - Validates file presence, MIME type, size
   - Returns `{ filePath, fileType, statusCode: 200 }`
   - Error handling: 400, 413, 415

3. **Create upload routes** → `backend/src/routes/uploadRoutes.ts`
   - `POST /upload` → uploadController.uploadFile
   - Use multer middleware

4. **Register routes in server** → `backend/src/index.ts`
   - Import and use uploadRoutes
   - Test: `curl -X POST http://localhost:3010/upload -F "file=@test.pdf"`

5. **Verify**
   - Upload a test PDF: should return 200 with filePath
   - Upload unsupported file: should return 415
   - Upload >10MB: should return 413
   - File exists in `uploads/` directory

**Ticket:** `BE-004: Create Validation Utilities & Rules` (2 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create validator** → `backend/src/application/validators/candidateValidator.ts`
   - Class: `CandidateValidator`
   - Methods for each field: `validateFirstName()`, `validateEmail()`, `validateEducationArray()`, etc.
   - Return format: `{ isValid: boolean, errors?: Record<string, string[]> }`
   - Rules: See `Backend_Implementation_Tickets.md` → BE-004

2. **Create DTOs** → `backend/src/application/dto/candidate.dto.ts`
   - Export: `CandidateDTO`, `CreateCandidatePayload`, `EducationInput`, `WorkExperienceInput`

3. **Unit tests** → `backend/src/tests/validators.test.ts` (if time allows)
   - Test happy path (valid data)
   - Test validation failures (required, invalid email, date logic)

4. **Verify**
   - No TypeScript errors: `npx tsc --noEmit`
   - Validator can be imported and instantiated without errors

---

### Frontend Tasks (FE-002, FE-003, FE-004, FE-005)

**Ticket:** `FE-002: Build Personal Information Form Fields` (2 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Create personal info section** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - Add form fields: firstName, lastName, email, phone, address
   - Use React Bootstrap: Form.Group, Form.Label, Form.Control
   - State management with `useState`
   - Each field has `id` and `htmlFor` for labels

2. **Add styling** → `frontend/src/components/AddCandidate/AddCandidate.module.css` (optional)
   - Consistent spacing and layout

3. **Verify**
   - Component renders all 5 fields
   - User can type in fields without errors
   - No console errors

**Ticket:** `FE-003: Implement Education Section with Dynamic Rows` (3 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Add education section** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - Array state: `educations: Array<{ institution, title, startDate, endDate }>`
   - Helper functions: `addEducation()`, `removeEducation(index)`, `updateEducation(index, field, value)`
   - Render rows with `.map()`, unique keys
   - "Add Education" button (disabled when 3 rows)
   - "Remove" button per row (no remove if only 1 row)

2. **Verify**
   - Add/remove buttons work
   - Max 3 rows enforced
   - Each row editable independently
   - No console errors

**Ticket:** `FE-004: Implement Work Experience Section with Dynamic Rows` (3 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Add work experience section** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - Same pattern as FE-003, but max 10 rows
   - Fields: company, position, description, startDate, endDate
   - Helper functions: `addExperience()`, `removeExperience()`, `updateExperience()`

2. **Verify**
   - Add/remove works, max 10 enforced
   - Form state is clean and testable

**Ticket:** `FE-005: Implement CV Upload Section` (2.5 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Add CV upload section** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - File input with `accept=".pdf,.docx"`
   - State: `cv: File | null`
   - Client-side validation: file type (MIME check) and size (10MB)
   - Display filename if selected
   - "Clear" button to reset
   - Error messages for validation failures

2. **Verify**
   - Upload PDF: accepted
   - Upload DOCX: accepted
   - Upload .txt: rejected with clear error
   - Upload >10MB: rejected with clear error
   - Clear button resets state

### Validation Checkpoint (User Reviews)

**Before proceeding, verify:**

**Backend:**
- [ ] `POST /upload` test with valid PDF: returns 200 + filePath
- [ ] `POST /upload` test with unsupported file: returns 415
- [ ] `POST /upload` test with >10MB: returns 413
- [ ] File saved in `uploads/` directory
- [ ] CandidateValidator class instantiates without errors
- [ ] `npx tsc --noEmit` passes

**Frontend:**
- [ ] Personal info section renders all 5 fields
- [ ] Education section: Add → 3 rows max, Remove works
- [ ] Work experience section: Add → 10 rows max, Remove works
- [ ] CV upload: PDF/DOCX accepted, .txt rejected, size validation works
- [ ] All sections editable without console errors
- [ ] `npm run lint` passes

**Rollback Strategy:**
```bash
# If form structure broken, revert to Phase 1:
git reset --hard phase-1-foundation
git clean -fd

# Or selectively:
git checkout HEAD~N -- frontend/src/components/AddCandidate/AddCandidate.tsx
```

**Save Progress:**
```bash
git add -A
git commit -m "[CHECKPOINT] Phase 2: File upload, form sections, validators ready"
git tag phase-2-infrastructure
```

---

## PHASE 3: Core Logic & Submission (Days 3–3.5)

### Goal
Build backend service layer and controller for candidate creation; wire frontend form to API.

### Backend Tasks (BE-005, BE-006, BE-007)

**Ticket:** `BE-005: Implement Candidate Service (Business Logic)` (2.5 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create service** → `backend/src/application/services/candidateService.ts`
   - Class: `CandidateService(prisma, validator, fileStorage)`
   - Method: `createCandidateWithEducationAndExperience(payload)`
   - Validates payload using CandidateValidator
   - Creates candidate + nested education/work experience

2. **Define repository pattern** (if not already using Prisma directly)
   - Optional: Create `ICandidateRepository` interface
   - Implementation with Prisma methods

3. **Verify**
   - Service instantiates with injected dependencies
   - No TypeScript errors

**Ticket:** `BE-006: Implement Candidate Controller & Route Handler` (2 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create controller** → `backend/src/presentation/controllers/candidateController.ts`
   - Class: `CandidateController(candidateService)`
   - Method: `createCandidate(req, res)` 
   - Calls service.createCandidateWithEducationAndExperience()
   - Returns 201 + DTO

2. **Create routes** → `backend/src/routes/candidateRoutes.ts`
   - `POST /candidates` → controller.createCandidate

3. **Register in server** → `backend/src/index.ts`
   - Import candidateRoutes
   - Test with Postman: POST http://localhost:3010/candidates with valid payload

4. **Verify**
   - POST /candidates with valid data → 201 + candidate object
   - No business logic in controller

**Ticket:** `BE-007: Implement Database Transaction for Candidate Creation` (1.5 hours)

**Specialist:** backend_developer

**Steps:**

1. **Wrap service method in transaction** → `backend/src/application/services/candidateService.ts`
   - Use `prisma.$transaction(async (tx) => { /* all ops */ })`
   - All candidate creation happens atomically

2. **Test transaction rollback**
   - Manually test: POST with duplicate email → should roll back
   - Verify no partial records in DB

3. **Verify**
   - No errors when creating valid candidate
   - Duplicate email correctly rejected

---

### Frontend Tasks (FE-006, FE-008)

**Ticket:** `FE-006: Implement Client-Side Form Validation` (3 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Create validation utilities** → `frontend/src/utils/validationUtils.ts`
   - Functions: `validateFirstName()`, `validateEmail()`, `validateDates()`, etc.
   - Return: `{ isValid: boolean, error?: string }`
   - Mirror backend rules (see BE-004)

2. **Add validation to component** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - State: `errors: Record<string, string>`
   - On form submission: run validation, populate errors
   - Display errors below fields (red border on input)
   - Block submission if errors exist

3. **Unit tests** → `frontend/src/components/AddCandidate/AddCandidate.test.tsx`
   - Test validation functions
   - Test form prevents submission with errors

4. **Verify**
   - Missing firstName: error shows
   - Invalid email: error shows
   - Valid data: no errors, form ready to submit

**Ticket:** `FE-008: Integrate API Submission & Upload Flow` (2.5 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Create service** → `frontend/src/services/candidateService.ts`
   - Function: `uploadCV(file: File): Promise<{ filePath, fileType }>`
   - Function: `createCandidate(data: CandidateFormData): Promise<Candidate>`
   - Use Axios with `process.env.REACT_APP_API_URL`

2. **Wire form submission** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - `handleSubmit()`:
     - Run validation
     - If CV file: call uploadCV() → get filePath
     - Build candidate payload with CV metadata
     - Call createCandidate()
     - Show loading state during request

3. **Setup API URL** → `frontend/.env`
   ```env
   REACT_APP_API_URL=http://localhost:3010
   ```

4. **Verify**
   - Form submission calls backend endpoint
   - Create candidate succeeds (200 or 201)
   - Backend receives correct data structure
   - Loading state shows during request

### Validation Checkpoint (User Reviews)

**Backend:**
- [ ] POST /candidates with valid payload → 201 + created candidate object
- [ ] POST /candidates with duplicate email → 409 (or appropriate error)
- [ ] POST /candidates with missing fields → 400 with field errors
- [ ] Database: candidate + education + work experience records created together
- [ ] If transaction forced to fail: no partial records remain
- [ ] `npm run build` succeeds

**Frontend:**
- [ ] Form validates all fields on submit
- [ ] Invalid email shows error
- [ ] Submit disabled if validation fails
- [ ] Submit calls API (check Network tab in DevTools)
- [ ] Loading state visible during submission
- [ ] `npm run lint` passes

**Integration Test:**
- [ ] Fill form with valid data, including CV, submit
- [ ] Backend creates candidate successfully
- [ ] Response returns candidate object with ID

**Rollback Strategy:**
```bash
# If service/controller broken:
git diff HEAD~5 backend/src/application/services/
git checkout HEAD~N -- backend/src/application/services/

# If form submission not working:
git checkout HEAD~N -- frontend/src/services/candidateService.ts
```

**Save Progress:**
```bash
git add -A
git commit -m "[CHECKPOINT] Phase 3: Core logic, form validation, API integration working"
git tag phase-3-core-logic
```

---

## PHASE 4: Quality & User Experience (Days 4–4.5)

### Goal
Add error handling, accessibility attributes, dashboard navigation, success/error feedback.

### Backend Tasks (BE-008, BE-009)

**Ticket:** `BE-008: Map Error Responses & Implement Standard Error Handling` (2 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create error classes** → `backend/src/domain/errors/`
   - Classes: `ValidationError`, `DuplicateEmailError`, `FileTooLargeError`, `UnsupportedFileTypeError`, `NotFoundError`

2. **Create error middleware** → `backend/src/middleware/errorHandler.ts`
   - Maps error types to HTTP status codes (400, 409, 413, 415, 500)
   - Returns consistent error response format
   - Logs errors (not sensitive data)

3. **Register middleware** → `backend/src/index.ts`
   - Add error handler as last middleware

4. **Update controllers to throw errors**
   - Throw `ValidationError`, `DuplicateEmailError`, etc. instead of generic Error
   - Let middleware catch and format

5. **Test error responses**
   - POST /candidates with validation error → 400 with field details
   - POST /candidates with duplicate email → 409
   - POST /upload with >10MB → 413
   - POST /upload with unsupported type → 415

6. **Verify**
   - All error responses follow standard format: `{ statusCode, error: { message, code, details } }`
   - Specific error codes help frontend handle appropriately

**Ticket:** `BE-009: Implement Security Validations & Input Sanitization` (1.5 hours)

**Specialist:** backend_developer

**Steps:**

1. **Input sanitization** → `backend/src/infrastructure/security.ts`
   - Function: `sanitizeString(input)` — trim, remove dangerous chars
   - Function: `validateFileSignature(buffer)` — check MIME magic bytes
   - Function: `sanitizePath(path)` — prevent directory traversal

2. **Apply sanitization in controller**
   - Sanitize all string inputs before processing
   - Validate file signatures server-side

3. **Security headers middleware** → `backend/src/middleware/securityHeaders.ts`
   - Set headers: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security

4. **Register security middleware** → `backend/src/index.ts`
   - Add before other middleware

5. **Verify**
   - No unsanitized inputs reach database
   - Security headers present in responses

---

### Frontend Tasks (FE-007, FE-009, FE-010)

**Ticket:** `FE-007: Add Accessibility & Semantic Attributes` (2 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Add ARIA labels** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - All fields have associated `<label htmlFor>`
   - Error messages have `role="alert"` and `aria-describedby`
   - Required fields marked with `aria-required="true"` and visual `*`
   - Dynamic rows use `aria-live="polite"` for add/remove announcements

2. **Use semantic HTML**
   - `<form>` instead of `<div>`
   - Proper heading hierarchy

3. **Test keyboard navigation**
   - Tab through all fields (logical order)
   - No keyboard traps
   - Focus indicators visible

4. **Color contrast check** (optional but recommended)
   - Use browser DevTools or axe DevTools to verify WCAG AA (4.5:1)

5. **Verify**
   - Form is keyboard-operable tab-only
   - Screen reader announces form structure
   - Required fields clearly marked

**Ticket:** `FE-009: Add Success/Error Feedback UX` (2 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Add feedback states to component** → `frontend/src/components/AddCandidate/AddCandidate.tsx`
   - State: `successMessage`, `errorMessage`, `isLoading`

2. **Show success toast**
   - On successful submission: display toast "Candidate added successfully"
   - Auto-dismiss after 3–5s
   - Redirect to `/candidates` or `/candidates/{id}`

3. **Show error feedback**
   - Display error banner at top of form (don't clear form)
   - Map backend HTTP codes to user-friendly messages:
     - 400 (validation) → "Please fix the errors below"
     - 409 (duplicate email) → "A candidate with this email already exists"
     - 413 (file too large) → "File exceeds 10 MB limit"
     - 415 (unsupported file) → "Unsupported file type. Use PDF or DOCX"
     - 500 → "An unexpected error occurred. Please try again"
   - Keep form values intact for retry

4. **Verify**
   - Success toast appears and disappears
   - Error messages map HTTP codes correctly
   - Form values retained on error

**Ticket:** `FE-010: Add Dashboard CTA & Navigation` (1.5 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Setup routing** → `frontend/src/App.tsx`
   - Import `BrowserRouter`, `Routes`, `Route`
   - Define route: `/candidates/new` → `<AddCandidate />`
   - (Optional dashboard route if not already defined)

2. **Add CTA button to dashboard** → `frontend/src/components/Dashboard.tsx` (or similar)
   - Button text: "+ Add Candidate"
   - Link to `/candidates/new` using React Router `<Link>`
   - Keyboard accessible, aria-label

3. **Verify**
   - Click button → navigate to form
   - Form mounts and renders
   - Back button works if form has navigation

### Validation Checkpoint (User Reviews)

**Backend:**
- [ ] POST with validation error → 400 with field-level error details
- [ ] POST with duplicate email → 409
- [ ] POST with file >10MB → 413
- [ ] POST with unsupported file → 415
- [ ] All responses follow standard error format
- [ ] Security headers present in responses
- [ ] `npm run build` succeeds

**Frontend:**
- [ ] Form is fully keyboard-navigable (Tab, Shift+Tab)
- [ ] All fields have labels and required markers
- [ ] Error messages have `role="alert"`
- [ ] Success toast appears after valid submission
- [ ] Form redirects to `/candidates` on success
- [ ] Error banner shows for backend errors; form retained for retry
- [ ] "Add Candidate" button visible on dashboard
- [ ] Clicking button navigates to form
- [ ] `npm run lint` passes
- [ ] Manual a11y test with axe DevTools passes

**Rollback Strategy:**
```bash
git reset --hard phase-3-core-logic
git clean -fd
```

**Save Progress:**
```bash
git add -A
git commit -m "[CHECKPOINT] Phase 4: Error handling, accessibility, UX complete"
git tag phase-4-quality-ux
```

---

## PHASE 5: Testing & Polish (Days 5+)

### Goal
Add comprehensive tests, update documentation, final review and merge.

### Backend Tasks (BE-010, BE-011)

**Ticket:** `BE-010: Write Integration Tests for API Contracts` (3 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create integration test file** → `backend/src/tests/integration/candidate.integration.test.ts`
   - Import Supertest for HTTP testing
   - Test `POST /candidates` success path
   - Test validation errors (400)
   - Test duplicate email (409)
   - Test file upload errors (413, 415, 404)
   - Verify database state after each test

2. **Run coverage report**
   ```bash
   npm run test:coverage
   ```
   - Aim for 80%+ coverage on controller/service

3. **Verify**
   - All test cases pass
   - Coverage report generated

**Ticket:** `BE-011: Write Unit Tests for Services & Validators` (2.5 hours)

**Specialist:** backend_developer

**Steps:**

1. **Create unit test files**
   - `backend/src/tests/unit/validators.test.ts` — test each validation function
   - `backend/src/tests/unit/candidateService.test.ts` — test service with mocked repo

2. **Mock dependencies**
   - Mock PrismaClient
   - Mock FileStorageService
   - Mock CandidateValidator

3. **Coverage targets**
   - Happy path: valid input → correct output
   - Error paths: invalid input → throws appropriate error
   - Edge cases: null/undefined, boundary values

4. **Verify**
   - All tests pass
   - Coverage >90%

---

### Frontend Tasks (FE-011)

**Ticket:** `FE-011: Write Unit & Integration Tests` (4 hours)

**Specialist:** frontend_developer

**Steps:**

1. **Create component tests** → `frontend/src/components/AddCandidate/AddCandidate.test.tsx`
   - Test rendering: all form sections present
   - Test user interaction: add/remove rows, type in fields
   - Test validation: errors display on invalid submit
   - Test API calls: form submits correct data
   - Test error feedback: error messages appear
   - Test success: redirect on success

2. **Create service tests** → `frontend/src/services/candidateService.test.ts`
   - Mock Axios
   - Test uploadCV success/error
   - Test createCandidate success/error
   - Verify correct API calls with correct payloads

3. **Create validation tests** → `frontend/src/utils/validationUtils.test.ts`
   - Test each validator function
   - Test edge cases (empty string, null, invalid format)

4. **Coverage targets**
   - Aim for 80%+ on component and services

5. **Verify**
   - `npm test` passes all tests
   - Coverage report generated

---

### Documentation & Final Review

**Steps:**

1. **Update API specification** → `ai-specs/specs/api-spec.yml`
   - Add `POST /candidates` endpoint with request/response schemas
   - Add `POST /upload` endpoint details
   - Add error response examples

2. **Update data model docs** → `ai-specs/specs/data-model.md`
   - Document Candidate, Education, WorkExperience, Resume entities
   - Include validation constraints

3. **Update development guide** if needed → `ai-specs/specs/development_guide.md`
   - Note new environment variables
   - Mention new file upload directory

4. **Code review checklist**
   - [ ] All code follows AGENTS.md standards (English, typing, SOLID)
   - [ ] Tests passing locally
   - [ ] No console warnings/errors
   - [ ] Documentation updated

5. **Verify**
   - `npm run build` succeeds (backend)
   - `npm run build` succeeds (frontend)
   - All tests pass: `npm test`
   - No hidden issues: `npm run lint`

**Save Final Progress:**
```bash
git add -A
git commit -m "[RELEASE] Phase 5: Complete Add Candidate feature with tests & docs"
git tag v1.0-add-candidate
```

---

## Rollback Strategy Summary

Each phase is tagged. To rollback to a previous phase:

```bash
# See all tags
git tag

# Rollback to a phase
git reset --hard phase-1-foundation
git clean -fd

# Or rollback one commit at a time
git log --oneline | head -20
git reset --hard <commit-hash>
```

## Memory Bank Structure

After each phase checkpoint passes, save progress to session memory:
- Phase name + ✅ indicator
- Key deliverables completed
- What's ready for next phase
- Any blockers encountered

---

## Timeline Summary

- **Day 1-1.5:** Phase 1 (Foundation) ← **User checkpoint review**
- **Day 2-2.5:** Phase 2 (Infrastructure) ← **User checkpoint review**
- **Day 3-3.5:** Phase 3 (Core Logic) ← **User checkpoint review**
- **Day 4-4.5:** Phase 4 (Quality & UX) ← **User checkpoint review**
- **Day 5+:** Phase 5 (Testing & Polish) ← **Final review, merge, release**

Each checkpoint is user-validated before proceeding to avoid wasted effort on broken implementations.
