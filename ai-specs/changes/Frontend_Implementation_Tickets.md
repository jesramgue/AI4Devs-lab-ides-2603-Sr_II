# Add Candidate Feature - Frontend Implementation Tickets

## Overview
This document breaks down the frontend work for the "Add Candidate" feature into atomic, single-purpose tickets following incremental development principles. Each ticket represents **one logical unit of work** that can be developed, tested, and reviewed independently.

---

## FE-001: Create AddCandidate Component Structure & Type Definitions

**Parent Story**: Add Candidate Feature  
**Type**: Foundation  
**Estimated Effort**: 2 hours  
**Blocks**: All subsequent frontend tickets

### Description
Set up the core component file, TypeScript types, and component scaffold for the AddCandidate feature.

### Technical Details
**Files to Create**:
- `frontend/src/components/AddCandidate.tsx` - Main form component (scaffold with basic structure)
- `frontend/src/types/candidate.types.ts` - TypeScript types for candidate data

**Types Required**:
```typescript
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Education {
  institution: string;
  title: string;
  startDate: Date;
  endDate?: Date;
}

export interface WorkExperience {
  company: string;
  position: string;
  description: string;
  startDate: Date;
  endDate?: Date;
}

export interface CVFile {
  filePath: string;
  fileType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

export interface CandidateFormData {
  personalInfo: PersonalInfo;
  educations: Education[];
  workExperiences: WorkExperience[];
  cv?: CVFile;
}
```

**AddCandidate Component Scaffold**:
- Component state hooks setup
- Empty/placeholder JSX structure
- Export component properly

### Acceptance Criteria
1. ✅ `AddCandidate.tsx` exports a functional React component
2. ✅ `candidate.types.ts` includes all interface definitions
3. ✅ Component renders without errors in development environment
4. ✅ All TypeScript types are properly exported and importable

### Definition of Done
- [ ] Files created and types defined
- [ ] No lint/TypeScript errors
- [ ] Component can be imported in tests
- [ ] Code reviewed

---

## FE-002: Build Personal Information Form Fields

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2 hours  
**Depends On**: FE-001  
**Blocks**: FE-006 (validation)

### Description
Implement the personal information section of the form with all required fields using React Bootstrap form components.

### Technical Details
**Fields to Implement**:
- `firstName` (text input, required)
- `lastName` (text input, required)
- `email` (email input, required)
- `phone` (tel input, optional)
- `address` (textarea, optional)

**Approach**:
- Use React Bootstrap `Form.Group`, `Form.Label`, `Form.Control` components
- Implement local state management using `useState` to track field values
- Add proper `id` and `htmlFor` attributes for label association
- Apply consistent spacing and styling (use React Bootstrap's grid system)

### Acceptance Criteria
1. ✅ All five personal info fields render correctly
2. ✅ Form fields are properly labeled with `<Form.Label>`
3. ✅ Each field has a unique `id` attribute
4. ✅ Optional fields are visually distinguished (e.g., "(Optional)" text)
5. ✅ Form fields maintain state on user input
6. ✅ No console errors or TypeScript issues

### Definition of Done
- [ ] Personal info section displays correctly
- [ ] All fields properly labeled and accessible
- [ ] State management working
- [ ] Styling consistent with design system
- [ ] Code reviewed

---

## FE-003: Implement Education Section with Dynamic Rows

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 3 hours  
**Depends On**: FE-001  
**Blocks**: FE-006 (validation)

### Description
Build the dynamic education section allowing users to add/remove up to 3 education records.

### Technical Details
**Fields per Row**:
- `institution` (text input, required)
- `title` (text input, required)
- `startDate` (date input, required)
- `endDate` (date input, optional)

**Functionality**:
- Display one empty education row by default
- "Add Education" button to add new rows (max 3 total)
- "Remove" button on each row (except when only 1 row exists)
- Disable "Add" button when 3 rows present
- Each row is independently editable

**Implementation Notes**:
- Use array state to manage education records
- Use `.map()` to render rows with unique `key` (use index cautiously; consider row ID)
- Use helper functions: `addEducation()`, `removeEducation()`, `updateEducation()`

### Acceptance Criteria
1. ✅ Single empty education row displays on load
2. ✅ "Add Education" button adds new row (up to 3 max)
3. ✅ "Remove" button removes row and updates array
4. ✅ "Add" button disabled when 3 rows present
5. ✅ User can edit each field independently
6. ✅ All date fields use proper date input type
7. ✅ No TypeScript errors

### Definition of Done
- [ ] Education section fully functional
- [ ] Add/remove buttons working correctly
- [ ] Max 3 items enforced
- [ ] State management clean and testable
- [ ] Code reviewed

---

## FE-004: Implement Work Experience Section with Dynamic Rows

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 3 hours  
**Depends On**: FE-001  
**Blocks**: FE-006 (validation)

### Description
Build the dynamic work experience section allowing users to add/remove up to 10 work experience records.

### Technical Details
**Fields per Row**:
- `company` (text input, required)
- `position` (text input, required)
- `description` (textarea, required)
- `startDate` (date input, required)
- `endDate` (date input, optional - can be null for current position)

**Functionality**:
- Display one empty work experience row by default
- "Add Experience" button to add new rows (max 10 total)
- "Remove" button on each row (except when only 1 row exists)
- Disable "Add" button when 10 rows present
- Each row is independently editable

**Implementation Notes**:
- Mirror FE-003 pattern using array state
- Use same helper function approach: `addExperience()`, `removeExperience()`, `updateExperience()`
- Handle optional `endDate` gracefully (current job scenario)

### Acceptance Criteria
1. ✅ Single empty work experience row displays on load
2. ✅ "Add Experience" button adds new row (up to 10 max)
3. ✅ "Remove" button removes row and updates array
4. ✅ "Add" button disabled when 10 rows present
5. ✅ User can edit each field independently
6. ✅ `endDate` field accepts null (current position)
7. ✅ No TypeScript errors

### Definition of Done
- [ ] Work experience section fully functional
- [ ] Add/remove buttons working correctly
- [ ] Max 10 items enforced
- [ ] State management clean and testable
- [ ] Code reviewed

---

## FE-005: Implement CV Upload Section

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2.5 hours  
**Depends On**: FE-001  
**Blocks**: FE-007 (accessibility), FE-008 (API integration), FE-009 (error handling)

### Description
Build the CV file upload section with file type validation and visual feedback.

### Technical Details
**Functionality**:
- File input accepting PDF and DOCX files only
- Display selected filename after upload
- Clear/remove button to reset selection
- Visual indicator showing file is ready to upload

**Implementation Notes**:
- Use HTML5 `<input type="file">` with `accept` attribute
- Validate file type on client-side (check `file.type`)
- Store file in component state temporarily
- Do NOT upload to server yet (handled in FE-008)
- Show user-friendly error if unsupported file selected

**Validation Logic**:
```
Allowed MIME types:
- application/pdf
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
Max file size: 10 MB (validate after selection, show error if exceeded)
```

### Acceptance Criteria
1. ✅ File input accepts PDF and DOCX files only (via `accept` attribute)
2. ✅ Selected filename displays after selection
3. ✅ File type validation shows error for unsupported formats
4. ✅ File size validation shows error for > 10 MB files
5. ✅ "Clear" button resets file selection
6. ✅ Error messages are clear and user-friendly
7. ✅ File state properly managed in component state

### Definition of Done
- [ ] File upload section displays correctly
- [ ] File validation working (type and size)
- [ ] UI feedback clear for validation errors
- [ ] File selection state managed properly
- [ ] Code reviewed

---

## FE-006: Implement Client-Side Form Validation

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 3 hours  
**Depends On**: FE-002, FE-003, FE-004, FE-005  
**Blocks**: FE-008 (API integration), FE-009 (error handling)

### Description
Implement comprehensive client-side validation for all form fields with error messaging.

### Technical Details
**Validation Rules**:

**Personal Info**:
- `firstName`: Required, non-empty
- `lastName`: Required, non-empty
- `email`: Required, valid email format (regex or built-in HTML5 validation)
- `phone`: Optional (if provided, validate format - basic international)
- `address`: Optional (no validation needed)

**Education Rows**:
- `institution`: Required, non-empty
- `title`: Required, non-empty
- `startDate`: Required, valid date
- `endDate`: Optional, but if provided must be >= `startDate`

**Work Experience Rows**:
- `company`: Required, non-empty
- `position`: Required, non-empty
- `description`: Required, non-empty
- `startDate`: Required, valid date
- `endDate`: Optional, but if provided must be >= `startDate`

**Implementation**:
- Create separate `validationUtils.ts` file with validation functions
- Each validator returns: `{ isValid: boolean; error?: string }`
- Store field-level errors in component state (e.g., `errors` object)
- Validate on form submission (not real-time)
- Display error messages below each field
- Highlight invalid fields (e.g., red border)

### Acceptance Criteria
1. ✅ Required field validation blocks submission with clear error
2. ✅ Email format validation works correctly
3. ✅ Date consistency validation (`endDate >= startDate`) works
4. ✅ All error messages are displayed below respective fields
5. ✅ Invalid fields have visual styling (e.g., red border)
6. ✅ Form does not submit if validation fails
7. ✅ Errors clear when user corrects field

### Definition of Done
- [ ] Validation logic extracted to `validationUtils.ts`
- [ ] All validation rules implemented
- [ ] Error display UX clear and consistent
- [ ] Unit tests for validators written
- [ ] Code reviewed

---

## FE-007: Add Accessibility & Semantic Attributes

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 2 hours  
**Depends On**: FE-002, FE-003, FE-004, FE-005, FE-006  
**Blocks**: FE-010 (dashboard integration)

### Description
Implement WCAG 2.1 AA accessibility features including labels, ARIA attributes, and keyboard navigation.

### Technical Details
**Accessibility Requirements**:
- All form fields have associated `<label>` elements with `htmlFor`
- Error messages linked to fields via `aria-describedby`
- Form has `role="form"` or use semantic `<form>` element
- "Required" fields marked with `aria-required="true"` and visual indicator (*)
- Error messages have `role="alert"` for screen reader announcement
- Dynamic rows announced with `aria-live="polite"` (add/remove confirmation)
- Add/Remove buttons have clear, descriptive labels

**Testing**:
- Test keyboard navigation (Tab, Shift+Tab)
- Test with screen reader (NVDA/JAWS if available)
- Verify color contrast ratios (WCAG AA: 4.5:1 for text)

### Acceptance Criteria
1. ✅ All form fields have associated `<label>` elements
2. ✅ Required fields marked with `aria-required="true"` and visual *
3. ✅ Error messages use `aria-describedby` linkage
4. ✅ Error announcements have `role="alert"`
5. ✅ Keyboard navigation works (no keyboard traps)
6. ✅ Form elements are in logical tab order
7. ✅ Color contrast meets WCAG AA standards
8. ✅ Screen reader announces form structure and errors

### Definition of Done
- [ ] All ARIA attributes added
- [ ] Keyboard navigation tested
- [ ] Color contrast verified
- [ ] Accessibility audit passed (axe DevTools or similar)
- [ ] Code reviewed

---

## FE-008: Integrate API Submission & Upload Flow

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2.5 hours  
**Depends On**: FE-002, FE-003, FE-004, FE-005, FE-006  
**Blocks**: FE-009 (error handling)

### Description
Connect form submission to backend API calls (`POST /upload` for CV, `POST /candidates` for candidate data).

### Technical Details
**Implementation**:
- Create `candidateService.ts` file with API functions
- Function `uploadCV(file: File): Promise<{ filePath: string; fileType: string }>`
- Function `createCandidate(data: CandidateFormData): Promise<Candidate>`
- Use Axios for HTTP requests (already in dependencies)
- Set proper headers (Content-Type, etc.)

**Submission Flow**:
1. User clicks "Submit"
2. Client-side validation runs
3. If valid, show loading state
4. If CV file selected, upload first → get `filePath` and `fileType`
5. Build candidate payload with CV metadata
6. Submit candidate data to `POST /candidates`
7. On success → show confirmation (handled in FE-009)

**Error Handling - Basic**:
- Catch API errors and pass to error handler (FE-009)
- Log errors to console (development)

### Acceptance Criteria
1. ✅ CV upload works and returns file metadata
2. ✅ Candidate creation endpoint called with correct payload structure
3. ✅ Form data properly transformed to API contract format
4. ✅ Loading state shows during submission
5. ✅ API errors caught and passed to error handler
6. ✅ No console errors
7. ✅ TypeScript types for API responses defined

### Definition of Done
- [ ] `candidateService.ts` created with both API functions
- [ ] Form submission flow integrated
- [ ] Loading state displays during requests
- [ ] API integration tested with backend (manual or via integration tests)
- [ ] Code reviewed

---

## FE-009: Add Success/Error Feedback UX

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 2 hours  
**Depends On**: FE-008  
**Blocks**: FE-010 (dashboard integration)

### Description
Implement user feedback for success and error scenarios including toast/alert messages and form state handling.

### Technical Details
**Success Scenario**:
- Show toast/alert message: "Candidate added successfully"
- Toast auto-dismisses after 3-5 seconds
- Redirect to candidate list or detail page (route: `/candidates` or `/candidates/{id}`)
- Clear form state

**Error Scenarios**:
- Network/Server error: "An error occurred. Please try again."
- Validation error (400): Display backend-provided validation error messages
- Duplicate email (409): "A candidate with this email already exists."
- File too large (413): "File exceeds maximum size of 10 MB."
- Unsupported file type (415): "File type not supported. Please use PDF or DOCX."
- Unknown error (500): "An unexpected error occurred. Please contact support."

**Implementation**:
- Use React Bootstrap `Alert` or toast component for feedback
- Keep form values intact on error (don't clear state)
- Show error banner at top of form
- Allow user to retry submission
- Log errors appropriately

### Acceptance Criteria
1. ✅ Success toast displays and auto-dismisses
2. ✅ Redirect after success happens correctly
3. ✅ Form clears after successful submission
4. ✅ Error messages display above form (not clear form)
5. ✅ Duplicate email error shows user-friendly message
6. ✅ File validation errors show specific messages
7. ✅ User can retry after error without data loss

### Definition of Done
- [ ] Success and error UX implemented
- [ ] Toast/alert messaging works
- [ ] Redirect behavior tested
- [ ] Error messages user-friendly and specific
- [ ] Code reviewed

---

## FE-010: Add Dashboard CTA & Navigation

**Parent Story**: Add Candidate Feature  
**Type**: Feature  
**Estimated Effort**: 1.5 hours  
**Depends On**: FE-001, FE-007, FE-009

### Description
Add "Add Candidate" call-to-action button to the recruiter dashboard and implement navigation to the AddCandidate form.

### Technical Details
**Changes**:
- Locate dashboard component (e.g., `frontend/src/components/Dashboard.tsx` or similar)
- Add button/CTA in primary actions area
- Button text: "Add Candidate" or "+ Add Candidate"
- Link to AddCandidate form page/modal
- Ensure button is keyboard accessible and screen-reader labeled

**Navigation Approach**:
- Add route in `App.tsx` or routing configuration: `/candidates/new` or `/add-candidate`
- Use React Router `<Link>` or programmatic navigation

**Placement**:
- Dashboard primary actions area (typically top right or header)
- Visually prominent but consistent with existing design

### Acceptance Criteria
1. ✅ "Add Candidate" button visible on dashboard
2. ✅ Button navigates to AddCandidate form
3. ✅ Button is keyboard accessible
4. ✅ Button has descriptive label for screen readers
5. ✅ Route properly configured
6. ✅ No navigation errors or console warnings

### Definition of Done
- [ ] Dashboard CTA button added
- [ ] Route configured
- [ ] Navigation working
- [ ] Accessibility verified
- [ ] Code reviewed

---

## FE-011: Write Unit & Integration Tests

**Parent Story**: Add Candidate Feature  
**Type**: Quality  
**Estimated Effort**: 4 hours  
**Depends On**: All previous frontend tickets  
**Blocks**: None (final ticket)

### Description
Write comprehensive tests covering form behavior, validation, submission, and error handling.

### Technical Details
**Test Coverage Target**: 90% for AddCandidate component and supporting utilities

**Unit Tests** (`frontend/src/tests/`):
- `candidateService.test.ts`: Test API calls with mocked Axios
- `validationUtils.test.ts`: Test all validation functions with edge cases
- `AddCandidate.test.tsx`: Component tests covering:
  - Form renders with correct fields
  - Validation errors display correctly
  - Dynamic rows add/remove correctly
  - File upload validation works
  - Form submission calls API with correct data
  - Success/error feedbacks show correctly

**Integration Tests**:
- Test complete form submission flow (end-to-end user scenario)
- Mock API responses
- Verify redirect after success

**Test Tools**:
- React Testing Library for component tests
- Jest for utilities tests
- Mock Axios for API calls

**Key Test Scenarios**:
- Happy path: Valid form submission → success
- Invalid form → validation errors → cannot submit
- Duplicate email → 409 error → error message
- File too large → error message
- Add/remove education rows → max 3 enforced
- Add/remove work experience rows → max 10 enforced

### Acceptance Criteria
1. ✅ Unit tests for validation utilities (all rules)
2. ✅ Component tests for form rendering
3. ✅ Tests for add/remove dynamic rows
4. ✅ Tests for file upload validation
5. ✅ Tests for form submission and API integration
6. ✅ Tests for error handling and UX
7. ✅ 90%+ code coverage for component and utilities
8. ✅ All tests passing in CI

### Definition of Done
- [ ] All test files created under `frontend/src/tests/`
- [ ] Test coverage report generated and reviewed
- [ ] All tests passing locally and in CI
- [ ] Code reviewed

---

## Implementation Sequence & Dependencies

```
FE-001 (Foundation)
  ├─ FE-002 (Personal Info)
  │   └─ FE-006 (Validation) ──┐
  ├─ FE-003 (Education)        ├─ FE-008 (API Integration)
  │   └─ FE-006 (Validation) ──┤   └─ FE-009 (Success/Error UX)
  ├─ FE-004 (Work Experience)  │       ├─ FE-010 (Dashboard CTA)
  │   └─ FE-006 (Validation) ──┤       └─ FE-011 (Tests)
  ├─ FE-005 (CV Upload)        │
  │   ├─ FE-007 (Accessibility)─┘
  │   └─ FE-008 (API Integration)
  └─ FE-007 (Accessibility)
      └─ FE-010 (Dashboard CTA)
          └─ FE-011 (Tests)
```

**Suggested Development Order** (parallel where possible):
1. **Phase 1** (Foundation): FE-001 only
2. **Phase 2** (Form Sections - Parallel): FE-002, FE-003, FE-004, FE-005 simultaneously
3. **Phase 3** (Core Logic): FE-006 (Validation)
4. **Phase 4** (Quality & Integration): FE-007, FE-008 simultaneously
5. **Phase 5** (UX & Navigation): FE-009, FE-010 simultaneously
6. **Phase 6** (Testing): FE-011

---

## Notes for Frontend Developers

### Code Organization
- Keep helper functions (`addEducation`, `removeEducation`, etc.) as separate utility functions for reusability
- Extract validation logic into `src/validationUtils.ts` for testability
- Create `src/services/candidateService.ts` for all API interactions
- Use the type definitions from `src/types/candidate.types.ts` throughout

### Styling & Design Consistency
- Use React Bootstrap components for consistency
- Maintain spacing via Bootstrap grid and spacing utilities
- Apply global CSS from `src/index.css` and component-level CSS
- Ensure responsive design (mobile-first approach)

### State Management
- For this feature, local component state (`useState`) is adequate
- If feature grows, consider lifting state or using Context API
- Avoid prop drilling; use helper functions within component

### Error Handling Best Practices
- Distinguish between user errors (validation) and system errors (API failures)
- Always show actionable error messages
- Log system errors to console (dev) and monitoring service (prod)

### Accessibility Checklist
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios
- [ ] Ensure logical tab order
- [ ] Test at different zoom levels (up to 200%)

