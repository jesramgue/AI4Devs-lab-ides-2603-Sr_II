import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

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

const getDescribedBy = (...ids: Array<string | undefined>): string | undefined => {
  const validIds = ids.filter(Boolean);

  return validIds.length > 0 ? validIds.join(' ') : undefined;
};

const renderRequiredLabel = (label: string): React.ReactNode => (
  <>
    {label}
    <span className="required-indicator" aria-hidden="true">
      *
    </span>
  </>
);

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const errorPayload = error.response?.data as
      | { error?: { code?: string; message?: string }; message?: string }
      | undefined;

    switch (statusCode) {
      case 400:
        return errorPayload?.error?.message || 'Please review the highlighted fields and try again.';
      case 409:
        return 'A candidate with this email already exists.';
      case 413:
        return 'The uploaded CV is too large. Please select a smaller file.';
      case 415:
        return 'The selected CV file type is not supported.';
      case 500:
        return 'Something went wrong while saving the candidate. Please try again.';
      default:
        return (
          errorPayload?.error?.message ||
          errorPayload?.message ||
          'Unable to submit candidate at this time. Please try again.'
        );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to submit candidate at this time. Please try again.';
};

const AddCandidate: React.FC = () => {
  const navigate = useNavigate();
  const initialFormData = createInitialFormData();

  const [formData, setFormData] = useState<CandidateFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<CandidateFormErrors>(createInitialErrors(initialFormData));
  const [fileError, setFileError] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string>('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const validateForm = (currentFormData: CandidateFormData): CandidateFormErrors => ({
    personalInfo: validatePersonalInfo(currentFormData.personalInfo),
    educations: currentFormData.educations.map((education) => validateEducationRow(education)),
    workExperiences: currentFormData.workExperiences.map((workExperience) =>
      validateWorkExperienceRow(workExperience),
    ),
    cvFile: fileError || undefined,
  });

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

    setLiveAnnouncement('Education row added.');
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

    setLiveAnnouncement(`Education row ${index + 1} removed.`);
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

    setLiveAnnouncement('Work experience row added.');
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

    setLiveAnnouncement(`Work experience row ${index + 1} removed.`);
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
      setSubmissionError('Please correct the highlighted fields before submitting.');
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

      const successMessage = 'Candidate submitted successfully.';
      const nextInitialData = createInitialFormData();

      setFormData(nextInitialData);
      setFormErrors(createInitialErrors(nextInitialData));
      setFileError('');
      setSubmissionSuccess(successMessage);
      setLiveAnnouncement('Candidate submitted successfully. Redirecting to dashboard.');
      navigate('/', { state: { successMessage } });
    } catch (error) {
      setSubmissionError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBytesToMb = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <Container as="main" className="app-shell py-4">
      <div className="form-toolbar">
        <div>
          <Link className="form-back-link" to="/">
            Back to Dashboard
          </Link>
          <h1 className="mb-1 mt-3">Add Candidate</h1>
          <p className="visually-muted mb-0">Complete all required fields to submit a new candidate.</p>
        </div>
      </div>

      <div className="visually-hidden" aria-live="polite">
        {liveAnnouncement}
      </div>

      {submissionError ? (
        <Alert variant="danger" className="mb-4" role="alert">
          {submissionError}
        </Alert>
      ) : null}

      {submissionSuccess ? (
        <Alert variant="success" className="mb-4" role="alert">
          {submissionSuccess}
        </Alert>
      ) : null}

      <Form onSubmit={handleSubmit} noValidate>
        <fieldset className="mb-4">
          <legend className="h4">Personal Information</legend>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label htmlFor="firstName">{renderRequiredLabel('First Name')}</Form.Label>
                <Form.Control
                  id="firstName"
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(event) => updatePersonalInfo('firstName', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.firstName)}
                  required
                  aria-required="true"
                  aria-describedby={getDescribedBy(
                    formErrors.personalInfo.firstName ? 'firstName-error' : undefined,
                  )}
                />
                <Form.Control.Feedback id="firstName-error" type="invalid" role="alert">
                  {formErrors.personalInfo.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label htmlFor="lastName">{renderRequiredLabel('Last Name')}</Form.Label>
                <Form.Control
                  id="lastName"
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(event) => updatePersonalInfo('lastName', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.lastName)}
                  required
                  aria-required="true"
                  aria-describedby={getDescribedBy(
                    formErrors.personalInfo.lastName ? 'lastName-error' : undefined,
                  )}
                />
                <Form.Control.Feedback id="lastName-error" type="invalid" role="alert">
                  {formErrors.personalInfo.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label htmlFor="email">{renderRequiredLabel('Email')}</Form.Label>
                <Form.Control
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(event) => updatePersonalInfo('email', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.email)}
                  required
                  aria-required="true"
                  aria-describedby={getDescribedBy(
                    formErrors.personalInfo.email ? 'email-error' : undefined,
                  )}
                />
                <Form.Control.Feedback id="email-error" type="invalid" role="alert">
                  {formErrors.personalInfo.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label htmlFor="phone">Phone</Form.Label>
                <Form.Control
                  id="phone"
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(event) => updatePersonalInfo('phone', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.phone)}
                  aria-describedby={getDescribedBy(
                    formErrors.personalInfo.phone ? 'phone-error' : undefined,
                  )}
                />
                <Form.Control.Feedback id="phone-error" type="invalid" role="alert">
                  {formErrors.personalInfo.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label htmlFor="address">Address</Form.Label>
                <Form.Control
                  id="address"
                  as="textarea"
                  rows={2}
                  value={formData.personalInfo.address}
                  onChange={(event) => updatePersonalInfo('address', event.target.value)}
                  isInvalid={Boolean(formErrors.personalInfo.address)}
                  aria-describedby={getDescribedBy(
                    formErrors.personalInfo.address ? 'address-error' : undefined,
                  )}
                />
                <Form.Control.Feedback id="address-error" type="invalid" role="alert">
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
                <Form.Group>
                  <Form.Label htmlFor={`education-institution-${index}`}>
                    {renderRequiredLabel('Institution')}
                  </Form.Label>
                  <Form.Control
                    id={`education-institution-${index}`}
                    type="text"
                    value={education.institution}
                    onChange={(event) => updateEducation(index, 'institution', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.institution)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.educations[index]?.institution
                        ? `education-institution-${index}-error`
                        : undefined,
                    )}
                  />
                  <Form.Control.Feedback
                    id={`education-institution-${index}-error`}
                    type="invalid"
                    role="alert"
                  >
                    {formErrors.educations[index]?.institution}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`education-title-${index}`}>{renderRequiredLabel('Title')}</Form.Label>
                  <Form.Control
                    id={`education-title-${index}`}
                    type="text"
                    value={education.title}
                    onChange={(event) => updateEducation(index, 'title', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.title)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.educations[index]?.title ? `education-title-${index}-error` : undefined,
                    )}
                  />
                  <Form.Control.Feedback id={`education-title-${index}-error`} type="invalid" role="alert">
                    {formErrors.educations[index]?.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label htmlFor={`education-startDate-${index}`}>
                    {renderRequiredLabel('Start Date')}
                  </Form.Label>
                  <Form.Control
                    id={`education-startDate-${index}`}
                    type="date"
                    value={education.startDate}
                    onChange={(event) => updateEducation(index, 'startDate', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.startDate)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.educations[index]?.startDate
                        ? `education-startDate-${index}-error`
                        : undefined,
                    )}
                  />
                  <Form.Control.Feedback
                    id={`education-startDate-${index}-error`}
                    type="invalid"
                    role="alert"
                  >
                    {formErrors.educations[index]?.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label htmlFor={`education-endDate-${index}`}>End Date</Form.Label>
                  <Form.Control
                    id={`education-endDate-${index}`}
                    type="date"
                    value={education.endDate}
                    onChange={(event) => updateEducation(index, 'endDate', event.target.value)}
                    isInvalid={Boolean(formErrors.educations[index]?.endDate)}
                    aria-describedby={getDescribedBy(
                      formErrors.educations[index]?.endDate
                        ? `education-endDate-${index}-error`
                        : undefined,
                    )}
                  />
                  <Form.Control.Feedback
                    id={`education-endDate-${index}-error`}
                    type="invalid"
                    role="alert"
                  >
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
          <div className="section-actions">
            <Button
              type="button"
              variant="outline-primary"
              onClick={addEducation}
              disabled={formData.educations.length >= MAX_ROWS || isSubmitting}
            >
              Add Education
            </Button>
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="h4">Work Experience</legend>
          {formData.workExperiences.map((workExperience, index) => (
            <Row className="g-3 mb-3" key={`work-experience-${index}`}>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`work-company-${index}`}>{renderRequiredLabel('Company')}</Form.Label>
                  <Form.Control
                    id={`work-company-${index}`}
                    type="text"
                    value={workExperience.company}
                    onChange={(event) => updateExperience(index, 'company', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.company)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.workExperiences[index]?.company ? `work-company-${index}-error` : undefined,
                    )}
                  />
                  <Form.Control.Feedback id={`work-company-${index}-error`} type="invalid" role="alert">
                    {formErrors.workExperiences[index]?.company}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`work-position-${index}`}>{renderRequiredLabel('Position')}</Form.Label>
                  <Form.Control
                    id={`work-position-${index}`}
                    type="text"
                    value={workExperience.position}
                    onChange={(event) => updateExperience(index, 'position', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.position)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.workExperiences[index]?.position ? `work-position-${index}-error` : undefined,
                    )}
                  />
                  <Form.Control.Feedback id={`work-position-${index}-error`} type="invalid" role="alert">
                    {formErrors.workExperiences[index]?.position}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label htmlFor={`work-description-${index}`}>
                    {renderRequiredLabel('Description')}
                  </Form.Label>
                  <Form.Control
                    id={`work-description-${index}`}
                    as="textarea"
                    rows={2}
                    value={workExperience.description}
                    onChange={(event) => updateExperience(index, 'description', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.description)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.workExperiences[index]?.description
                        ? `work-description-${index}-error`
                        : undefined,
                    )}
                  />
                  <Form.Control.Feedback
                    id={`work-description-${index}-error`}
                    type="invalid"
                    role="alert"
                  >
                    {formErrors.workExperiences[index]?.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label htmlFor={`work-startDate-${index}`}>{renderRequiredLabel('Start Date')}</Form.Label>
                  <Form.Control
                    id={`work-startDate-${index}`}
                    type="date"
                    value={workExperience.startDate}
                    onChange={(event) => updateExperience(index, 'startDate', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.startDate)}
                    required
                    aria-required="true"
                    aria-describedby={getDescribedBy(
                      formErrors.workExperiences[index]?.startDate
                        ? `work-startDate-${index}-error`
                        : undefined,
                    )}
                  />
                  <Form.Control.Feedback id={`work-startDate-${index}-error`} type="invalid" role="alert">
                    {formErrors.workExperiences[index]?.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label htmlFor={`work-endDate-${index}`}>End Date</Form.Label>
                  <Form.Control
                    id={`work-endDate-${index}`}
                    type="date"
                    value={workExperience.endDate}
                    onChange={(event) => updateExperience(index, 'endDate', event.target.value)}
                    isInvalid={Boolean(formErrors.workExperiences[index]?.endDate)}
                    aria-describedby={getDescribedBy(
                      formErrors.workExperiences[index]?.endDate ? `work-endDate-${index}-error` : undefined,
                    )}
                  />
                  <Form.Control.Feedback id={`work-endDate-${index}-error`} type="invalid" role="alert">
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
          <div className="section-actions">
            <Button
              type="button"
              variant="outline-primary"
              onClick={addExperience}
              disabled={formData.workExperiences.length >= MAX_ROWS || isSubmitting}
            >
              Add Experience
            </Button>
          </div>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="h4">CV Upload</legend>
          <Form.Group>
            <Form.Label htmlFor="cvFile">Upload CV (PDF or DOCX)</Form.Label>
            <Form.Control
              id="cvFile"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              isInvalid={Boolean(fileError || formErrors.cvFile)}
              aria-describedby={getDescribedBy(
                'cvFile-help',
                fileError || formErrors.cvFile ? 'cvFile-error' : undefined,
              )}
            />
            <Form.Text id="cvFile-help">
              Accepted formats: PDF or DOCX. Maximum size: {MAX_FILE_SIZE_MB} MB.
            </Form.Text>
            <Form.Control.Feedback id="cvFile-error" type="invalid" role="alert">
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
