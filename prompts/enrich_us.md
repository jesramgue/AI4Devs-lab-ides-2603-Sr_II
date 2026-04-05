# Prompt
/enrich-us
Añadir Candidato al Sistema
Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:

Accesibilidad de la función: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.

Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.

Validación de datos: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.

Carga de documentos: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.

Confirmación de añadido: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.

Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.

Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.

Notas:

La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.

Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.

Tareas Técnicas:

Implementar la interfaz de usuario para el formulario de añadir candidato.

Desarrollar el backend necesario para procesar la información ingresada en el formulario.

Asegurar la seguridad y privacidad de los datos del candidato.

# Response

Voy a tomar tu historia de usuario y enriquecerla en un formato más accionable para desarrollo (frontend, backend, validaciones, seguridad y pruebas). Primero revisaré las plantillas/comandos del repo para respetar el formato esperado y luego te dejo el resultado listo para usar.

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/.commands)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/.commands/enrich-us.md)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/Solution-Steps.md)

Ya vi la guía del comando: pide enriquecer la US con detalle técnico completo (endpoints, campos, archivos, pruebas y requisitos no funcionales). Ahora revisaré la arquitectura real del proyecto para proponerte una historia totalmente implementable.

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/README.md)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/backend/prisma/schema.prisma)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/backend/src/index.ts)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/frontend/src/App.tsx)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/specs/api-spec.yml#1-1), lines 1 to 260

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/codex.md)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/changes/SCRUM-10-Position-Update.md#1-1), lines 1 to 320

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/changes/SCRUM-10_backend.md#1-1), lines 1 to 320

Ran terminal command:  rg --files backend/src frontend/src

Detecté que ripgrep no está instalado en este entorno, así que voy a mapear archivos con `find` para mantener referencias reales antes de entregarte la US enriquecida.

Ran terminal command:  find backend/src -type f | sort

Ran terminal command:  find frontend/src -type f | sort

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/backend/package.json)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/frontend/package.json)

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/specs/backend-standards.mdc#1-1), lines 1 to 260

Searched for regex `model Candidate|CreateCandidateRequest|firstName|education|workExperience|resume|cv` (`**/ai-specs/specs/data-model.md`), 29 results

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/specs/data-model.md#1-1), lines 1 to 180

Searched for regex `CreateCandidateRequest|CandidateDetails|EducationRequest|WorkExperienceRequest|Resume` (`**/ai-specs/specs/api-spec.yml`), 20 results

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/specs/api-spec.yml#500-500), lines 500 to 1030

## [original]
As a recruiter,  
I want to add candidates to the ATS,  
So that I can manage their data and selection process efficiently.

Acceptance criteria provided:
- Visible entry point from recruiter dashboard.
- Candidate form with personal data, education, and work experience.
- Input validation (required fields + valid email format).
- CV upload (PDF or DOCX).
- Success confirmation after submission.
- Error handling for server/network failures.
- Accessible and cross-device/browser compatible UI.
- Optional autocomplete support for education/work experience.

## [enhanced]

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
