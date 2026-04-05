# Phase 1: Foundation

## Backend (BE-001)
**Description:** Extend Prisma Data Model for Candidate Entity

### Copy this prompt for your backend agent:

```
You are a backend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: Node.js, Express.js, TypeScript, Prisma, PostgreSQL
Pattern: DDD with layered architecture

## Task: Phase 1 - Foundation (Backend)
Execute ticket BE-001: Extend Prisma Data Model for Candidate Entity

### Deliverables
1. Extend backend/prisma/schema.prisma with:
   - Candidate model (id, firstName, lastName, email unique, phone, address, createdAt, updatedAt)
   - Education model (id, candidateId FK, institution, title, startDate, endDate, createdAt, updatedAt)
   - WorkExperience model (id, candidateId FK, company, position, description, startDate, endDate, createdAt, updatedAt)
   - Resume model (id, candidateId FK, filePath, fileType, createdAt, updatedAt)
   - All with cascading deletes on candidate deletion

2. Run Prisma migration:
   ```bash
   cd backend
   npx prisma migrate dev --name add_candidate_entities
   ```

3. Generate Prisma types:
   ```bash
   npx prisma generate
   ```

4. Verify no TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

### Validation Checklist
- [ ] Backend: `prisma migrate dev --name add_candidate_entities` runs successfully
- [ ] Backend: `npx prisma studio` can browse all new tables
- [ ] No TypeScript errors: `npx tsc --noEmit` passes
- [ ] Prisma client types generated in node_modules/@prisma/client

### Reference
See `ai-specs/changes/Backend_Implementation_Tickets.md` → BE-001 for detailed schema specifications and constraints.

### Standards
- Follow DDD: entities have clear identity and domain meaning
- Use TypeScript strict mode
- Use clear, descriptive naming (camelCase for fields)
- Include timestamps (createdAt, updatedAt) on all entities
- Enforce data integrity with unique constraints and cascading deletes

**Important:** Complete only the items in this ticket. Do NOT implement services, controllers, or routes yet.
```

## Frontend (FE-001)
**Description:** Create AddCandidate Component Structure & Type Definitions + Install Dependencies

### Copy this prompt for your frontend agent:

```
You are a frontend_developer implementing the Add Candidate feature incrementally.

## Context
Project: LTI (Learning Tech Integration)
Tech Stack: React 18.3.1, TypeScript, React Bootstrap, Axios, Create React App
Pattern: Component → Service → API integration

## Task: Phase 1 - Foundation (Frontend)
Execute ticket FE-001: Create AddCandidate Component Structure & Type Definitions + Install Dependencies

### Deliverables
1. Install missing npm dependencies:
   ```bash
   cd frontend
   npm install react-router-dom@6.23.1 react-bootstrap@2.10.2 axios
   ```

2. Create type definitions file → frontend/src/types/candidate.types.ts:
   Export TypeScript interfaces:
   - PersonalInfo (firstName, lastName, email, phone, address)
   - Education (institution, title, startDate, endDate)
   - WorkExperience (company, position, description, startDate, endDate)
   - CVFile (file, fileType, fileSize)
   - CandidateFormData (personalInfo, educations[], workExperiences[], cvFile)

3. Create component scaffold → frontend/src/components/AddCandidate/AddCandidate.tsx:
   - React functional component with React.FC<> typing
   - Export default
   - Minimal UI with React Bootstrap (Form, Button, Container)
   - Basic imports: useState, useEffect hooks

4. Verify no lint or TypeScript errors:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm start  # Should run without errors
   ```

### Validation Checklist
- [ ] Frontend: All new dependencies installed (`npm ls react-router-dom react-bootstrap axios`)
- [ ] Frontend: Component can be imported in App.tsx without errors
- [ ] Frontend: `npm run lint` passes
- [ ] Frontend: `npm start` runs without warnings
- [ ] No missing module errors in console

### Reference
See `ai-specs/changes/Frontend_Implementation_Tickets.md` → FE-001 for detailed type specifications and component structure.

### Standards
- Use TypeScript strict mode
- Export types from dedicated types/ folder
- Use React Bootstrap for consistent UI (no custom CSS initially)
- Component names use PascalCase (AddCandidate)
- Type names and interfaces use PascalCase
- Keep component logic minimal at this stage (scaffold only)

**Important:** Complete only the items in this ticket. Do NOT implement form fields or validation yet.
```

---


