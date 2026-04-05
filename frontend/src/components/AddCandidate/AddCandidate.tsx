import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';

import { createCandidate, uploadCV } from '../../services/candidateService';
import {
  CandidateFormData,
  CreateCandidatePayload,
  CVFile,
  Education,
  PersonalInfo,
  WorkExperience,
} from '../../types/candidate.types';
import {
  validateEducationRow,
  validatePersonalInfo,
  validateWorkExperienceRow,
} from '../../utils/validationUtils';

const MAX_ROWS = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

type PersonalInfoErrors = Partial<Record<keyof PersonalInfo, string>>;
type EducationErrors = Partial<Record<keyof Education, string>>;
type WorkExperienceErrors = Partial<Record<keyof WorkExperience, string>>;

interface CandidateFormErrors {
  personalInfo: PersonalInfoErrors;
  educations: EducationErrors[];
  workExperiences: WorkExperienceErrors[];
  cvFile?: string;
}

const createEmptyPersonalInfo = (): PersonalInfo => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
});

const createEmptyEducation = (): Education => ({
  institution: '',
  title: '',
  startDate: '',
  endDate: '',
});

const createEmptyWorkExperience = (): WorkExperience => ({
  company: '',
  position: '',
  description: '',
  startDate: '',
  endDate: '',
});

const createEmptyCvFile = (): CVFile => ({
  file: null,
  fileType: '',
  fileSize: 0,
});

const createInitialFormData = (): CandidateFormData => ({
  personalInfo: createEmptyPersonalInfo(),
  educations: [createEmptyEducation()],
  workExperiences: [createEmptyWorkExperience()],
  cvFile: createEmptyCvFile(),
});

const createInitialErrors = (formData: CandidateFormData): CandidateFormErrors => ({
  personalInfo: {},
  educations: formData.educations.map(() => ({})),
  workExperiences: formData.workExperiences.map(() => ({})),
});

const hasAnyFieldError = (errorRecord: Record<string, string | undefined>): boolean =>
  Object.values(errorRecord).some(Boolean);

const hasFormErrors = (errors: CandidateFormErrors): boolean => {
  const personalInfoHasErrors = hasAnyFieldError(errors.personalInfo);
  const educationHasErrors = errors.educations.some((errorRecord) => hasAnyFieldError(errorRecord));
  const workExperienceHasErrors = errors.workExperiences.some((errorRecord) =>
    hasAnyFieldError(errorRecord),
  );

  return personalInfoHasErrors || educationHasErrors || workExperienceHasErrors || Boolean(errors.cvFile);
};

const buildCandidatePayload = (
  formData: CandidateFormData,
  cvFilePath?: string,
): CreateCandidatePayload => ({
  firstName: formData.personalInfo.firstName.trim(),
  lastName: formData.personalInfo.lastName.trim(),
  email: formData.personalInfo.email.trim(),
  phone: formData.personalInfo.phone.trim() || undefined,
  address: formData.personalInfo.address.trim() || undefined,
  educations: formData.educations.map((education) => ({
    institution: education.institution.trim(),
    title: education.title.trim(),
    startDate: education.startDate,
    endDate: education.endDate || undefined,
  })),
  workExperiences: formData.workExperiences.map((workExperience) => ({
    company: workExperience.company.trim(),
    position: workExperience.position.trim(),
    description: workExperience.description.trim(),
    startDate: workExperience.startDate,
    endDate: workExperience.endDate || undefined,
  })),
  cvFilePath,
});

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;

    if (apiMessage) {
      return apiMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to submit candidate at this time. Please try again.';
};

const AddCandidate: React.FC = () => {
  const [formData, setFormData] = useState<CandidateFormData>(createInitialFormData());
  const [formErrors, setFormErrors] = useState<CandidateFormErrors>(createInitialErrors(createInitialFormData()));
  const [fileError, setFileError] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string>('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = (currentFormData: CandidateFormData): CandidateFormErrors => {
    const nextErrors: CandidateFormErrors = {
      personalInfo: validatePersonalInfo(currentFormData.personalInfo),
      educations: currentFormData.educations.map((education) => validateEducationRow(education)),
      workExperiences: currentFormData.workExperiences.map((workExperience) =>
        validateWorkExperienceRow(workExperience),
      ),
      cvFile: fileError || undefined,
    };

    return nextErrors;
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string): void => {
    setFormData((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [field]: value,
      },
    }));

    setFormErrors((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [field]: undefined,
      },
    }));
  };

  const addEducation = (): void => {
    setFormData((previous) => {
      if (previous.educations.length >= MAX_ROWS) {
        return previous;
      }

      return {
        ...previous,
        educations: [...previous.educations, createEmptyEducation()],
      };
    });

    setFormErrors((previous) => ({
      ...previous,
      educations: [...previous.educations, {}],
    }));
  };

  const removeEducation = (index: number): void => {
    setFormData((previous) => {
      if (previous.educations.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        educations: previous.educations.filter((_, currentIndex) => currentIndex !== index),
      };
    });

    setFormErrors((previous) => ({
      ...previous,
      educations: previous.educations.length > 1
        ? previous.educations.filter((_, currentIndex) => currentIndex !== index)
        : previous.educations,
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string): void => {
    setFormData((previous) => ({
      ...previous,
      educations: previous.educations.map((education, currentIndex) => {
        if (currentIndex !== index) {
          return education;
        }

        return {
          ...education,
          [field]: value,
        };
      }),
    }));

    setFormErrors((previous) => ({
      ...previous,
      educations: previous.educations.map((educationError, currentIndex) => {
        if (currentIndex !== index) {
          return educationError;
        }

        return {
          ...educationError,
          [field]: undefined,
        };
      }),
    }));
  };

  const addExperience = (): void => {
    setFormData((previous) => {
      if (previous.workExperiences.length >= MAX_ROWS) {
        return previous;
      }

      return {
        ...previous,
        workExperiences: [...previous.workExperiences, createEmptyWorkExperience()],
      };
    });

    setFormErrors((previous) => ({
      ...previous,
      workExperiences: [...previous.workExperiences, {}],
    }));
  };

  const removeExperience = (index: number): void => {
    setFormData((previous) => {
      if (previous.workExperiences.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        workExperiences: previous.workExperiences.filter(
          (_, currentIndex) => currentIndex !== index,
        ),
      };
    });

    setFormErrors((previous) => ({
      ...previous,
      workExperiences: previous.workExperiences.length > 1
        ? previous.workExperiences.filter((_, currentIndex) => currentIndex !== index)
        : previous.workExperiences,
    }));
  };

  const updateExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string,
  ): void => {
    setFormData((previous) => ({
      ...previous,
      workExperiences: previous.workExperiences.map((workExperience, currentIndex) => {
        if (currentIndex !== index) {
          return workExperience;
        }

        return {
          ...workExperience,
          [field]: value,
        };
      }),
    }));

    setFormErrors((previous) => ({
      ...previous,
      workExperiences: previous.workExperiences.map((workExperienceError, currentIndex) => {
        if (currentIndex !== index) {
          return workExperienceError;
        }

        return {
          ...workExperienceError,
          [field]: undefined,
        };
      }),
    }));
  };

  const clearFile = (): void => {
    setFileError('');
    setFormErrors((previous) => ({
      ...previous,
      cvFile: undefined,
    }));

    setFormData((previous) => ({
      ...previous,
      cvFile: createEmptyCvFile(),
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      clearFile();
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      const nextFileError = 'Unsupported file type. Please upload a PDF or DOCX file.';
      setFileError(nextFileError);
      setFormErrors((previous) => ({
        ...previous,
        cvFile: nextFileError,
      }));
      event.target.value = '';
      setFormData((previous) => ({
        ...previous,
        cvFile: createEmptyCvFile(),
      }));
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      const nextFileError = `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
      setFileError(nextFileError);
      setFormErrors((previous) => ({
        ...previous,
        cvFile: nextFileError,
      }));
      event.target.value = '';
      setFormData((previous) => ({
        ...previous,
        cvFile: createEmptyCvFile(),
      }));
      return;
    }

    setFileError('');
    setFormErrors((previous) => ({
      ...previous,
      cvFile: undefined,
    }));

    setFormData((previous) => ({
      ...previous,
      cvFile: {
        file: selectedFile,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    setSubmissionError('');
    setSubmissionSuccess('');

    const validationErrors = validateForm(formData);
    setFormErrors(validationErrors);

    if (hasFormErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedCvFilePath: string | undefined;

      if (formData.cvFile.file) {
        const uploadResponse = await uploadCV(formData.cvFile.file);
        uploadedCvFilePath = uploadResponse.filePath;
      }

      const payload = buildCandidatePayload(formData, uploadedCvFilePath);
      await createCandidate(payload);

      const nextInitialData = createInitialFormData();
      setFormData(nextInitialData);
      setFormErrors(createInitialErrors(nextInitialData));
      setFileError('');
      setSubmissionSuccess('Candidate submitted successfully.');
    } catch (error) {
      setSubmissionError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBytesToMb = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <Container className="py-4">
      <h1 className="mb-4">Add Candidate</h1>

      {submissionError ? (
        <Alert variant="danger" className="mb-4">
          {submissionError}
        </Alert>
      ) : null}

      {submissionSuccess ? (
        <Alert variant="success" className="mb-4">
          {submissionSuccess}
        </Alert>
      ) : null}

      <Form onSubmit={handleSubmit} noValidate>
        <fieldset className="mb-4">
          <legend className="h4">Personal Information</legend>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="firstName">
                <Form.Label htmlFor="firstName">First Name</Form.Label>
                <Form.Control
                  id="firstName"
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(event) => updatePersonalInfo('firstName', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.firstName)}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.personalInfo.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label htmlFor="lastName">Last Name</Form.Label>
                <Form.Control
                  id="lastName"
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(event) => updatePersonalInfo('lastName', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.lastName)}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.personalInfo.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="email">
                <Form.Label htmlFor="email">Email</Form.Label>
                <Form.Control
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(event) => updatePersonalInfo('email', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.email)}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.personalInfo.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="phone">
                <Form.Label htmlFor="phone">Phone</Form.Label>
                <Form.Control
                  id="phone"
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(event) => updatePersonalInfo('phone', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.phone)}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.personalInfo.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="address">
                <Form.Label htmlFor="address">Address</Form.Label>
                <Form.Control
                  id="address"
                  as="textarea"
                  rows={2}
                  value={formData.personalInfo.address}
                  onChange={(event) => updatePersonalInfo('address', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.address)}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.personalInfo.address}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="h4">Education</legend>
          {formData.educations.map((education, index) => (
            <Row className="g-3 mb-3" key={`education-${index}`}>
              <Col md={6}>
                <Form.Group controlId={`education-institution-${index}`}>
                  <Form.Label htmlFor={`education-institution-${index}`}>Institution</Form.Label>
                  <Form.Control
                    id={`education-institution-${index}`}
                    type="text"
                    value={education.institution}
                    onChange={(event) => updateEducation(index, 'institution', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.institution)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.educations[index]?.institution}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId={`education-title-${index}`}>
                  <Form.Label htmlFor={`education-title-${index}`}>Title</Form.Label>
                  <Form.Control
                    id={`education-title-${index}`}
                    type="text"
                    value={education.title}
                    onChange={(event) => updateEducation(index, 'title', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.title)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.educations[index]?.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`education-startDate-${index}`}>
                  <Form.Label htmlFor={`education-startDate-${index}`}>Start Date</Form.Label>
                  <Form.Control
                    id={`education-startDate-${index}`}
                    type="date"
                    value={education.startDate}
                    onChange={(event) => updateEducation(index, 'startDate', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.startDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.educations[index]?.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`education-endDate-${index}`}>
                  <Form.Label htmlFor={`education-endDate-${index}`}>End Date</Form.Label>
                  <Form.Control
                    id={`education-endDate-${index}`}
                    type="date"
                    value={education.endDate}
                    onChange={(event) => updateEducation(index, 'endDate', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.endDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.educations[index]?.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="button"
                  variant="outline-danger"
                  className="w-100"
                  onClick={() => removeEducation(index)}
                  disabled={formData.educations.length <= 1 || isSubmitting}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button
            type="button"
            variant="outline-primary"
            onClick={addEducation}
            disabled={formData.educations.length >= MAX_ROWS || isSubmitting}
          >
            Add Education
          </Button>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="h4">Work Experience</legend>
          {formData.workExperiences.map((workExperience, index) => (
            <Row className="g-3 mb-3" key={`work-experience-${index}`}>
              <Col md={6}>
                <Form.Group controlId={`work-company-${index}`}>
                  <Form.Label htmlFor={`work-company-${index}`}>Company</Form.Label>
                  <Form.Control
                    id={`work-company-${index}`}
                    type="text"
                    value={workExperience.company}
                    onChange={(event) => updateExperience(index, 'company', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.company)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.workExperiences[index]?.company}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId={`work-position-${index}`}>
                  <Form.Label htmlFor={`work-position-${index}`}>Position</Form.Label>
                  <Form.Control
                    id={`work-position-${index}`}
                    type="text"
                    value={workExperience.position}
                    onChange={(event) => updateExperience(index, 'position', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.position)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.workExperiences[index]?.position}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId={`work-description-${index}`}>
                  <Form.Label htmlFor={`work-description-${index}`}>Description</Form.Label>
                  <Form.Control
                    id={`work-description-${index}`}
                    as="textarea"
                    rows={2}
                    value={workExperience.description}
                    onChange={(event) => updateExperience(index, 'description', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.description)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.workExperiences[index]?.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`work-startDate-${index}`}>
                  <Form.Label htmlFor={`work-startDate-${index}`}>Start Date</Form.Label>
                  <Form.Control
                    id={`work-startDate-${index}`}
                    type="date"
                    value={workExperience.startDate}
                    onChange={(event) => updateExperience(index, 'startDate', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.startDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.workExperiences[index]?.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`work-endDate-${index}`}>
                  <Form.Label htmlFor={`work-endDate-${index}`}>End Date</Form.Label>
                  <Form.Control
                    id={`work-endDate-${index}`}
                    type="date"
                    value={workExperience.endDate}
                    onChange={(event) => updateExperience(index, 'endDate', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.endDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.workExperiences[index]?.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="button"
                  variant="outline-danger"
                  className="w-100"
                  onClick={() => removeExperience(index)}
                  disabled={formData.workExperiences.length <= 1 || isSubmitting}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button
            type="button"
            variant="outline-primary"
            onClick={addExperience}
            disabled={formData.workExperiences.length >= MAX_ROWS || isSubmitting}
          >
            Add Experience
          </Button>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="h4">CV Upload</legend>
          <Form.Group controlId="cvFile">
            <Form.Label htmlFor="cvFile">Upload CV (PDF or DOCX)</Form.Label>
            <Form.Control
              id="cvFile"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              isInvalid={Boolean(fileError || formErrors.cvFile)}
            />
            <Form.Text>
              Accepted formats: PDF or DOCX. Maximum size: {MAX_FILE_SIZE_MB} MB.
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              {fileError || formErrors.cvFile}
            </Form.Control.Feedback>
          </Form.Group>

          {formData.cvFile.file ? (
            <div className="mt-3">
              <p className="mb-1">
                <strong>Name:</strong> {formData.cvFile.file.name}
              </p>
              <p className="mb-1">
                <strong>Type:</strong> {formData.cvFile.fileType}
              </p>
              <p className="mb-3">
                <strong>Size:</strong> {formatBytesToMb(formData.cvFile.fileSize)}
              </p>
              <Button type="button" variant="outline-secondary" onClick={clearFile} disabled={isSubmitting}>
                Clear File
              </Button>
            </div>
          ) : null}
        </fieldset>

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Candidate'}
        </Button>
      </Form>
    </Container>
  );
};

export default AddCandidate;
