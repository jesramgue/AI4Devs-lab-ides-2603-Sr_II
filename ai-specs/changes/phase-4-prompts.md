# Phase 4: Quality & User Experience

## Backend (BE-008, BE-009)
Description: Standardized error mapping and security hardening

Copy this prompt for your backend agent:

```text
You are a backend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: Node.js, Express.js, TypeScript, Prisma, PostgreSQL
Pattern: DDD layered architecture with explicit domain errors and centralized middleware handling.

## Task: Phase 4 - Quality & User Experience (Backend)
Execute these tickets together:
1. BE-008: Map Error Responses & Implement Standard Error Handling
2. BE-009: Implement Security Validations & Input Sanitization

### Deliverables

BE-008 Error Handling Standardization
1. Create error classes in backend/src/domain/errors/:
	- ValidationError
	- DuplicateEmailError
	- FileTooLargeError
	- UnsupportedFileTypeError
	- NotFoundError
2. Create backend/src/middleware/errorHandler.ts:
	- Map domain errors to status codes 400, 404, 409, 413, 415, 500
	- Return consistent shape:
	  {
		 statusCode,
		 error: { message, code, details? }
	  }
	- Avoid leaking sensitive internals in 500 responses
3. Register error middleware as the final middleware in backend/src/index.ts
4. Update controllers/services to throw domain errors rather than generic Error where applicable

BE-009 Security & Sanitization
1. Create backend/src/infrastructure/security.ts with sanitization helpers:
	- sanitizeString(input)
	- sanitizePath(path)
	- optional helpers for payload sanitization
2. Apply sanitization before persistence and file handling operations
3. Create backend/src/middleware/securityHeaders.ts to set at least:
	- X-Content-Type-Options: nosniff
	- X-Frame-Options: DENY
	- Strict-Transport-Security (environment-appropriate)
4. Register security headers middleware early in backend/src/index.ts
5. Ensure upload path handling prevents directory traversal

### Validation Checklist
- [ ] Validation errors return 400 with field-level details
- [ ] Duplicate email returns 409 with clear, stable error code/message
- [ ] Oversized file returns 413
- [ ] Unsupported file type returns 415
- [ ] Unknown failures return 500 with safe generic message
- [ ] All error responses follow the standard format
- [ ] Security headers are present on responses
- [ ] npx tsc --noEmit passes
- [ ] npm run build passes

### Constraints
- Do not start Phase 5 testing scope in this phase
- Keep API contracts backward-compatible with completed Phase 3 behavior
- Preserve layered architecture boundaries (controller/service/domain/middleware)

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/Backend_Implementation_Tickets.md
- ai-specs/changes/implementation-strategy.md
```

## Frontend (FE-007, FE-009, FE-010)
Description: Accessibility, user feedback UX, and dashboard navigation

Copy this prompt for your frontend agent:

```text
You are a frontend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: React 18, TypeScript, React Bootstrap, React Router
Pattern: Accessible form UX with clear success/error states and navigable routing.

## Task: Phase 4 - Quality & User Experience (Frontend)
Execute these tickets together:
1. FE-007: Add Accessibility & Semantic Attributes
2. FE-009: Add Success/Error Feedback UX
3. FE-010: Add Dashboard CTA & Navigation

### Deliverables

FE-007 Accessibility
1. Improve Add Candidate form semantics and a11y in frontend/src/components/AddCandidate/AddCandidate.tsx:
	- Ensure associated labels for all controls
	- Mark required fields with visual marker and aria-required
	- Link error messages via aria-describedby
	- Add role="alert" to error messages
	- Preserve logical keyboard tab order and visible focus states
2. Add aria-live="polite" for dynamic row add/remove announcements where meaningful
3. Use semantic form structure and heading hierarchy

FE-009 Success/Error Feedback
1. Add or refine submit feedback states:
	- isLoading
	- successMessage
	- errorMessage
2. On success:
	- Show success toast/alert
	- Clear or reset form appropriately
	- Redirect to list/detail route per current app routing strategy
3. On error:
	- Show top-level error banner with friendly message
	- Keep form values for retry
	- Map backend error codes (400/409/413/415/500) to clear UI messages

FE-010 Dashboard CTA & Navigation
1. Add route for Add Candidate form in frontend/src/App.tsx if missing
2. Add dashboard CTA button (+ Add Candidate) in dashboard entry UI
3. Ensure CTA is keyboard accessible and has descriptive label
4. Verify navigation to form and back behavior

### Validation Checklist
- [ ] Form is keyboard-navigable end-to-end
- [ ] Required fields and errors are announced correctly for assistive tech
- [ ] Error messages use role="alert" and are linked to relevant fields
- [ ] Success message appears after valid submission
- [ ] Error banner appears for failed submission while retaining form data
- [ ] Dashboard CTA is visible and navigates to Add Candidate form
- [ ] Routing works without console warnings
- [ ] npm run lint passes
- [ ] npm run build passes

### Constraints
- Do not start FE-011 tests in this phase
- Keep compatibility with existing Phase 3 submit flow
- Avoid introducing breaking visual changes outside Add Candidate and dashboard entry points

### References
- ai-specs/changes/plan-addCandidate.md
- ai-specs/changes/Frontend_Implementation_Tickets.md
- ai-specs/changes/implementation-strategy.md
```

## 📋 What Phase 4 Accomplishes

1. Standardizes backend error responses so frontend handling is predictable.
2. Adds backend sanitization and secure response headers to reduce risk.
3. Makes Add Candidate flow accessible and semantically correct for keyboard and assistive technology users.
4. Introduces clear success/error UX so users understand submission outcomes.
5. Adds dashboard entry navigation to discover and reach Add Candidate quickly.

Outcome: The feature becomes production-safer, user-friendlier, and ready for Phase 5 testing/polish.

## 🎯 Launch Instructions

1. Run backend and frontend Phase 4 prompts in parallel.
2. Merge both outputs into your working branch.
3. Execute the combined validation checklist below.
4. If all checks pass, commit and tag the Phase 4 checkpoint.
5. Only then move to Phase 5.

Suggested local commands:

```bash
# Backend verification
cd backend
npm run build

# Frontend verification
cd frontend
npm run lint
npm run build
```

## ✅ Validation Checklist (After Both Complete)

Backend:
- [ ] Validation error -> 400 with structured details
- [ ] Duplicate email -> 409
- [ ] File too large -> 413
- [ ] Unsupported file -> 415
- [ ] Standard error payload shape in all error responses
- [ ] Security headers present in HTTP responses
- [ ] backend build passes

Frontend:
- [ ] Form fully keyboard-operable (Tab/Shift+Tab)
- [ ] Labels/required markers/a11y attributes present and correct
- [ ] Field errors linked and announced correctly
- [ ] Success feedback visible on valid submit
- [ ] Error feedback visible on failed submit with data preserved
- [ ] Dashboard CTA navigates correctly to Add Candidate
- [ ] frontend lint passes
- [ ] frontend build passes

Integration:
- [ ] End-to-end submit with success path verified
- [ ] End-to-end submit with representative error paths verified (400/409/413/415)

## 📌 Next: Save Checkpoint

```bash
git add -A
git commit -m "[CHECKPOINT] Phase 4: Error handling, accessibility, UX complete"
git tag phase-4-quality-ux
```

After this checkpoint, proceed to Phase 5 only.
