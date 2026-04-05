### User Story
As a recruiter,  
I want to create a new candidate record from the dashboard, including profile details, education, work experience, and CV,  
So that the recruitment process starts with complete, validated, and secure candidate data.

### Business Value
- Reduces manual data gaps at candidate intake.
- Standardizes initial candidate information quality.
- Enables downstream workflows (search, filtering, applications, interviews).

### Scope
- In scope: Candidate creation UI, backend endpoint, validation, CV upload, success/error feedback, basic accessibility.
- Out of scope: Parsing CV content, duplicate merge workflow, advanced OCR/AI extraction.

### Functional Requirements
1. Dashboard entry point
- A clearly visible CTA: `Add candidate`.
- Placement: recruiter dashboard primary actions area.
- Keyboard accessible and screen-reader labeled.

2. Candidate creation form
- Personal info fields:
  - `firstName` (required)
  - `lastName` (required)
  - `email` (required, unique)
  - `phone` (optional)
  - `address` (optional)
- Education section:
  - Repeating rows with `institution`, `title`, `startDate`, `endDate`.
- Work experience section:
  - Repeating rows with `company`, `position`, `description`, `startDate`, `endDate`.
- CV section:
  - Single upload input accepting PDF/DOCX.
- Submit and cancel actions.

3. Data validation
- Required field validation on client and server.
- Email format validation on client and server.
- Date consistency validation:
  - `endDate >= startDate` when end date exists.
- Maximum items:
  - Up to 3 education records.
  - Reasonable cap for work experience records (for example 10) to protect payload size.
- File validation:
  - MIME type: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
  - Max size: 10 MB.

4. Submission outcome
- On success:
  - Show confirmation toast/message: `Candidate added successfully`.
  - Redirect to candidate list or detail page.
- On failure:
  - Show user-friendly error banner and keep form values intact.

5. Accessibility and compatibility
- WCAG 2.1 AA baseline for form controls and error messages.
- Full keyboard navigation.
- Proper labels, `aria-describedby` for validation hints/errors.
- Tested in latest Chrome, Firefox, Safari and responsive breakpoints (mobile/tablet/desktop).

6. Autocomplete (optional enhancement)
- For education institution and company names, suggest existing values from system data.
- Suggestions should not block manual input.

### API and Contract Requirements
1. Create candidate endpoint
- Method and path: `POST /candidates`
- Content type: `application/json`
- Request body aligned with existing API contract:
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

2. Upload endpoint for CV
- Method and path: `POST /upload`
- Multipart form-data with file field.
- Returns persisted file metadata (`filePath`, `fileType`) for later use in `POST /candidates`.

3. Response handling
- `201` candidate created.
- `400` validation failure (field-level details).
- `409` duplicate email.
- `413` file too large (upload).
- `415` unsupported file type.
- `500` unexpected server error.

### Non-Functional Requirements
1. Security and privacy
- Validate and sanitize all user input server-side.
- Restrict upload file types and size.
- Store files outside public root with controlled access strategy.
- Avoid sensitive data logging.
- Follow least-privilege DB access and secure env config.

2. Performance
- Candidate create request target: p95 < 500 ms excluding file upload latency.
- Upload target: p95 < 2 s for 10 MB on standard broadband in non-prod benchmark.
- Prevent oversized payloads with request limits.

3. Reliability
- Atomic candidate creation transaction for candidate + education + work experience + resume metadata.
- If transaction fails, no partial candidate record should remain.

### Technical Tasks (Atomic)
1. Frontend
- Add dashboard CTA.
- Build `AddCandidate` form with dynamic education/work experience sections.
- Implement client-side validation and accessibility attributes.
- Integrate upload flow (`POST /upload`) and candidate submission (`POST /candidates`).
- Add success and error UX states.

2. Backend
- Extend data model in Prisma to include Candidate-related entities if not yet implemented.
- Implement/complete controller, service, and validation for `POST /candidates`.
- Implement/complete secure file upload endpoint.
- Add consistent error mapping (`400/409/413/415/500`).
- Wrap create flow in transaction.

3. Quality
- Unit tests for validators and services.
- Controller/integration tests for success and error paths.
- Frontend tests for form validation, submission, and feedback states.
- Accessibility checks for labels, keyboard flow, and error announcements.

4. Documentation
- Update API spec with final request/response and error schemas.
- Update data model docs with constraints and upload metadata.
- Add developer notes for local file upload setup and limits.

### Acceptance Criteria (Testable)
1. Recruiter can access `Add candidate` action from dashboard without navigation ambiguity.
2. Form includes all required sections and fields defined above.
3. Required field and email format validation prevent invalid submission.
4. CV upload only accepts PDF/DOCX and rejects unsupported types with explicit error.
5. Successful submission shows confirmation and candidate is persisted in DB.
6. Duplicate email returns conflict feedback without losing form state.
7. Server/network error shows user-friendly message and allows retry.
8. Form is keyboard operable and screen-reader understandable.
9. Feature works on mobile and desktop in supported browsers.
10. Automated tests cover critical happy path and error paths.

### Definition of Done
1. All acceptance criteria verified.
2. Backend and frontend tests passing in CI.
3. API and data model docs updated.
4. Security validations for upload and input implemented.
5. Code reviewed and merged with no high-severity findings.
