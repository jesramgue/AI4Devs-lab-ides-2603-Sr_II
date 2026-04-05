# Phase 5: Testing & Polish

## Backend (BE-010, BE-011)
Description: API integration tests, service/validator unit tests, and backend coverage hardening

Copy this prompt for your backend agent:

```text
You are a backend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: Node.js, Express.js, TypeScript, Prisma, PostgreSQL, Jest, Supertest
Pattern: DDD layered architecture with explicit service, validator, controller, and middleware boundaries.

## Task: Phase 5 - Testing & Polish (Backend)
Execute these tickets together:
1. BE-010: Write Integration Tests for API Contracts
2. BE-011: Write Unit Tests for Services & Validators

### Deliverables

BE-010 Integration Tests
1. Create integration tests for Add Candidate backend flow, likely under:
   - backend/src/tests/integration/candidate.integration.test.ts
2. Cover at minimum:
   - POST /candidates success path
   - validation failures returning 400
   - duplicate email conflict returning 409
   - upload-related error paths that are part of Add Candidate contract where feasible
   - nested education/work experience persistence behavior
3. Use Supertest and existing Jest setup
4. Keep tests deterministic and isolate database side effects appropriately

BE-011 Unit Tests
1. Create or complete unit tests for:
   - CandidateValidator
   - CandidateService
2. Mock Prisma and other injected dependencies where appropriate
3. Cover:
   - happy paths
   - edge cases
   - validation rule boundaries
   - transaction failure behavior / rollback expectations

### Quality Bar
1. Preserve existing API contracts from completed phases
2. Prefer focused tests over broad fragile mocks
3. Do not rewrite working production code just to satisfy tests unless a real defect is found
4. If coverage tooling already exists, generate/report coverage for backend-relevant files

### Validation Checklist
- [ ] Integration tests cover success and major error paths
- [ ] Unit tests cover validator rules and service behavior
- [ ] Tests pass locally
- [ ] Coverage is generated or improved meaningfully toward plan target
- [ ] npx tsc --noEmit passes
- [ ] npm run build passes

### Constraints
- Do not expand feature scope beyond Add Candidate testing/polish
- Keep test names, messages, and comments in English
- Avoid brittle tests tightly coupled to implementation details

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/Backend_Implementation_Tickets.md
- ai-specs/changes/implementation-strategy.md
```

## Frontend (FE-011)
Description: Component, service, validation, and integration-style tests for Add Candidate

Copy this prompt for your frontend agent:

```text
You are a frontend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: React 18, TypeScript, React Testing Library, Jest, Axios
Pattern: Typed component/state model with validation utilities and service-based API integration.

## Task: Phase 5 - Testing & Polish (Frontend)
Execute this ticket:
1. FE-011: Write Unit & Integration Tests

### Deliverables

FE-011 Frontend Test Coverage
1. Create or complete tests for:
   - AddCandidate component rendering and interaction flow
   - validation utilities
   - candidate service API functions
2. Cover at minimum:
   - form renders expected sections and fields
   - validation errors display when required fields are missing/invalid
   - dynamic education add/remove rules
   - dynamic work experience add/remove rules
   - CV upload validation behavior
   - successful submission flow with mocked API calls
   - error handling flow with mocked API failures
3. Use React Testing Library and Jest conventions already present in the repo
4. Mock Axios and routing/navigation where needed

### Quality Bar
1. Prefer behavior-focused tests rather than implementation-detail assertions
2. Keep tests deterministic and readable
3. Use English-only test descriptions and messages
4. Generate coverage if supported by current scripts/config

### Validation Checklist
- [ ] Component tests cover render, validation, and submission behavior
- [ ] Service tests verify correct API calls/payloads
- [ ] Validation utility tests cover happy path and edge cases
- [ ] Frontend test suite passes locally
- [ ] Coverage is generated or improved meaningfully toward plan target
- [ ] npm run build passes

### Constraints
- Do not change production behavior unless tests reveal a real defect
- Avoid rewriting large parts of the form just to make tests easier
- Keep compatibility with completed Phase 4 UX and routing

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/Frontend_Implementation_Tickets.md
- ai-specs/changes/implementation-strategy.md
```

## 📋 What Phase 5 Accomplishes

1. Verifies the Add Candidate flow through backend integration tests.
2. Protects core business rules with backend service and validator unit tests.
3. Verifies frontend form behavior, validation, and submission UX with component and service tests.
4. Improves confidence for future changes by raising coverage around the feature.
5. Finishes the feature with final documentation and release-readiness polish.

Outcome: The Add Candidate feature moves from implemented to defensible, test-backed, and ready for final review.

## 🎯 Launch Instructions

1. Run backend and frontend Phase 5 prompts in parallel.
2. Merge both outputs into your working branch.
3. Run the full validation checklist below.
4. If tests and builds are green, complete the documentation/final review items.
5. Save the Phase 5 checkpoint when everything is verified.

Suggested local commands:

```bash
# Backend
cd backend
npm test -- --runInBand
npm run build

# Frontend
cd frontend
npm test -- --watchAll=false --runInBand
npm run build
```

## ✅ Validation Checklist (After Both Complete)

Backend:
- [ ] Integration tests pass for create candidate contract
- [ ] Unit tests pass for candidate service and validator
- [ ] Important error paths are covered (400, 409, upload-related failures where applicable)
- [ ] backend build passes

Frontend:
- [ ] Component tests pass for render, validation, dynamic rows, and submit flow
- [ ] Service tests pass for upload/create API helpers
- [ ] Validation utility tests pass for field/date rules
- [ ] frontend test suite passes
- [ ] frontend build passes

Coverage:
- [ ] Coverage report generated or coverage command executed where supported
- [ ] Coverage is acceptable for the Add Candidate feature and improved versus pre-test state

Documentation / Final Review:
- [ ] API documentation updated if applicable
- [ ] Data model / development docs updated if needed
- [ ] No unresolved console errors, build errors, or failing tests remain

## 📌 Next: Save Checkpoint

```bash
git add -A
git commit -m "[CHECKPOINT] Phase 5: Tests, coverage, and final polish complete"
git tag phase-5-testing-polish
```

After this checkpoint, the Add Candidate feature is ready for final review and merge.