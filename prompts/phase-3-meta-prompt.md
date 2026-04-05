# Prompt
Provide the prompts for phase 3 and include:
📋 What Phase 3 Accomplishes
🎯 Launch Instructions
✅ Validation Checklist (After Both Complete)
📌 Next: Save Checkpoint

# Response
I’ll generate a dedicated Phase 3 prompt file first so you have backend and frontend copy/paste blocks, then I’ll summarize the goal, launch sequence, validation, and checkpoint commands.

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/changes/implementation-strategy.md)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/changes/phase-2-prompts.md)

I have the Phase 2 prompt structure and Phase 3 plan dependencies; I’m generating the Phase 3 prompt file now so it matches the same workflow format and is ready for parallel execution.

Created [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/changes/phase-3-prompts.md)

The Phase 3 prompt file is in place. I’m verifying the file and then I’ll give you the exact Phase 3 summary, launch steps, validation checklist, and checkpoint commands.

Ran terminal command:  cd /Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II && wc -l ai-specs/changes/phase-3-prompts.md && sed -n '1,48p' ai-specs/changes/phase-3-prompts.md

Phase 3 prompts are ready in:
- phase-3-prompts.md

Use that file to launch the backend and frontend agents in parallel for Phase 3.

### 📋 What Phase 3 Accomplishes

1. Backend moves from infrastructure to actual candidate creation flow:
- Candidate service is implemented.
- `POST /candidates` is exposed through controller and route registration.
- Candidate creation becomes atomic through a database transaction.

2. Frontend moves from form structure to actual submission behavior:
- Client-side validation is implemented.
- CV upload is connected to the backend.
- Candidate submission is wired to the backend API.

3. End-to-end creation path becomes available:
- User fills the form.
- Frontend validates data.
- CV uploads first if present.
- Candidate payload is submitted.
- Backend creates candidate plus related records together.

---

### 🎯 Launch Instructions

1. Open the Phase 3 prompt file:
- phase-3-prompts.md

2. Run both prompts in parallel:
- Backend agent: use the `Backend (BE-005, BE-006, BE-007)` block
- Frontend agent: use the `Frontend (FE-006, FE-008)` block

3. Let both agents finish before validating.

4. Then run the checks:
- Backend:
```bash
cd backend
npx tsc --noEmit
npm run build
```
- Frontend:
```bash
cd frontend
npm run lint
npm run build
```

5. Then manually verify the integrated create flow:
- fill form with valid values
- upload CV
- submit form
- confirm backend creates candidate correctly

---

### ✅ Validation Checklist (After Both Complete)

1. Backend validation:
- `POST /candidates` with valid payload returns `201`
- Response includes created candidate object
- Duplicate email is rejected with a conflict-style error
- Invalid payload returns validation errors
- Candidate, education, work experience, and resume records are created together
- Forced failure leaves no partial records in the database
- `npx tsc --noEmit` passes
- `npm run build` passes

2. Frontend validation:
- Missing required fields show validation errors
- Invalid email shows validation error
- Invalid date ranges show validation error
- Submit is blocked when validation fails
- Valid submission performs:
  - upload call first
  - create candidate call second
- Loading state is visible during submission
- Payload sent to backend matches the expected backend contract
- `npm run lint` passes
- `npm run build` passes

3. Integration validation:
- Fill the full form with valid data
- Add education and work experience rows
- Upload a valid PDF or DOCX
- Submit successfully
- Verify candidate is persisted with nested relations
- Verify response includes candidate ID

---

### 📌 Next: Save Checkpoint

If all validations pass:

```bash
git add -A
git commit -m "[CHECKPOINT] Phase 3: Core logic, form validation, API integration working"
git tag phase-3-core-logic
```

Optional verification:
```bash
git tag --list | grep phase-3-core-logic
```

After that:
1. Mark Phase 3 done in your strategy notes
2. Start Phase 4 only after this checkpoint is saved

If you want, I can also prepare the Phase 4 prompt file now so it is ready as soon as Phase 3 is validated.
