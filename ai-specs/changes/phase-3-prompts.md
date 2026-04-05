# Phase 3: Core Logic & Submission

## Backend (BE-005, BE-006, BE-007)
Description: Candidate service layer, controller/routes, atomic transaction handling

Copy this prompt for your backend agent:

```text
You are a backend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: Node.js, Express.js, TypeScript, Prisma, PostgreSQL
Pattern: DDD layered architecture. Services own business logic, controllers stay thin, transactions guarantee consistency.

## Task: Phase 3 - Core Logic & Submission (Backend)
Execute these tickets together:
1. BE-005: Implement Candidate Service (Business Logic)
2. BE-006: Implement Candidate Controller & Route Handler
3. BE-007: Implement Database Transaction for Candidate Creation

### Deliverables

BE-005 Candidate Service
1. Create backend/src/application/services/candidateService.ts
2. Implement a CandidateService class with injected dependencies:
   - prisma client
   - candidate validator
   - file storage service if needed for resume metadata integration
3. Add a creation method that:
   - validates the incoming payload using CandidateValidator
   - maps request data into Candidate, Education, WorkExperience, and Resume records
   - returns a clean DTO instead of raw Prisma models
4. Add DTO support using backend/src/application/dto/candidate.dto.ts if it still needs expansion
5. Handle duplicate email and validation failures with explicit domain-level errors or structured failures

BE-006 Controller and Routes
1. Create backend/src/presentation/controllers/candidateController.ts
2. Implement createCandidate(req, res)
   - parse request body
   - delegate to CandidateService
   - return 201 with created candidate DTO
3. Create backend/src/routes/candidateRoutes.ts
   - POST /candidates -> candidateController.createCandidate
4. Register candidate routes in backend/src/index.ts
5. Keep controllers thin. No business rules in controller methods.

BE-007 Transaction Handling
1. Wrap candidate creation in Prisma transaction
2. Ensure the following are atomic:
   - candidate record
   - education rows
   - work experience rows
   - resume record if provided
3. If any step fails, rollback entire operation
4. Verify rollback behavior using duplicate email or forced failure scenarios

### Validation Checklist
- [ ] POST /candidates with valid payload returns 201 and created candidate object
- [ ] POST /candidates with duplicate email is rejected with a conflict-style error
- [ ] POST /candidates with invalid payload returns validation errors
- [ ] Candidate, education, work experience, and resume are created together
- [ ] Forced failure leaves no partial records in database
- [ ] npx tsc --noEmit passes
- [ ] npm run build passes

### Constraints
- Do not implement full global error middleware in this phase unless absolutely necessary to complete the flow; that belongs to Phase 4
- Do not start security hardening tasks from Phase 4
- Keep response contracts aligned with Backend_Implementation_Tickets.md
- Preserve existing project structure and typing rigor

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/implementation-strategy.md
- ai-specs/changes/Backend_Implementation_Tickets.md
```

## Frontend (FE-006, FE-008)
Description: Client-side validation and API submission flow

Copy this prompt for your frontend agent:

```text
You are a frontend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: React 18, TypeScript, React Bootstrap, Axios
Pattern: Typed form component with local state, validation utilities, and service-based API integration.

## Task: Phase 3 - Core Logic & Submission (Frontend)
Execute these tickets together:
1. FE-006: Implement Client-Side Form Validation
2. FE-008: Integrate API Submission & Upload Flow

### Deliverables

FE-006 Validation
1. Create frontend/src/utils/validationUtils.ts
2. Implement validation functions for:
   - firstName
   - lastName
   - email
   - phone (if provided)
   - education rows
   - work experience rows
   - date consistency where endDate >= startDate
3. Return structured results such as:
   - { isValid: boolean, error?: string }
4. Update AddCandidate component to:
   - track field-level errors in state
   - validate on submit
   - block submission when invalid
   - display inline error messages
   - visually mark invalid fields

FE-008 API Integration
1. Create frontend/src/services/candidateService.ts
2. Implement API functions:
   - uploadCV(file)
   - createCandidate(payload)
3. Use Axios and REACT_APP_API_URL
4. Update AddCandidate submission flow:
   - run validation first
   - if CV exists, upload CV first
   - merge returned file metadata into final candidate payload
   - submit candidate payload to POST /candidates
   - show loading state during async operations
5. Add/update frontend/.env if needed:
   - REACT_APP_API_URL=http://localhost:3010

### Validation Checklist
- [ ] Missing required fields show validation errors
- [ ] Invalid email shows error
- [ ] Invalid date ranges show errors
- [ ] Submit is blocked when validation fails
- [ ] Valid submission triggers upload then candidate creation API calls
- [ ] Loading state appears during submission
- [ ] Payload shape sent to backend matches backend contract
- [ ] npm run lint passes
- [ ] npm run build passes

### Constraints
- Do not implement final success/error UX polish from Phase 4 yet
- Do not add dashboard navigation yet
- Keep validation rules aligned with backend rules from BE-004
- Preserve current form structure from Phase 2

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/implementation-strategy.md
- ai-specs/changes/Frontend_Implementation_Tickets.md
```

## Run Order
- Run backend and frontend prompts in parallel.
- After both finish, execute the validation checklist.
- If validation passes, save the Phase 3 checkpoint before moving to Phase 4.
