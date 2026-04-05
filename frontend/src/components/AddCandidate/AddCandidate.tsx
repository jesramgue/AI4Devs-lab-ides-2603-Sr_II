import React, { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';

import {
  CandidateFormData,
  CVFile,
  Education,
  PersonalInfo,
  WorkExperience,
} from '../../types/candidate.types';

const MAX_ROWS = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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

const AddCandidate: React.FC = () => {
  const [formData, setFormData] = useState<CandidateFormData>(createInitialFormData());
  const [fileError, setFileError] = useState<string>('');

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string): void => {
    setFormData((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [field]: value,
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
  };

  const clearFile = (): void => {
    setFileError('');
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
      setFileError('Unsupported file type. Please upload a PDF or DOCX file.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      event.target.value = '';
      return;
    }

    setFileError('');
    setFormData((previous) => ({
      ...previous,
      cvFile: {
        file: selectedFile,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      },
    }));
  };

  const formatBytesToMb = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <Container className="py-4">
      <h1 className="mb-4">Add Candidate</h1>
      <Form>
        <fieldset className="mb-4">
          <legend className="h4">Personal Information</legend>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  id="firstName"
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(event) => updatePersonalInfo('firstName', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  id="lastName"
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(event) => updatePersonalInfo('lastName', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(event) => updatePersonalInfo('email', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  id="phone"
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(event) => updatePersonalInfo('phone', event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="address">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  id="address"
                  as="textarea"
                  rows={2}
                  value={formData.personalInfo.address}
                  onChange={(event) => updatePersonalInfo('address', event.target.value)}
                />
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
                  <Form.Label>Institution</Form.Label>
                  <Form.Control
                    id={`education-institution-${index}`}
                    type="text"
                    value={education.institution}
                    onChange={(event) =>
                      updateEducation(index, 'institution', event.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId={`education-title-${index}`}>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    id={`education-title-${index}`}
                    type="text"
                    value={education.title}
                    onChange={(event) => updateEducation(index, 'title', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`education-startDate-${index}`}>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    id={`education-startDate-${index}`}
                    type="date"
                    value={education.startDate}
                    onChange={(event) => updateEducation(index, 'startDate', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`education-endDate-${index}`}>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    id={`education-endDate-${index}`}
                    type="date"
                    value={education.endDate}
                    onChange={(event) => updateEducation(index, 'endDate', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="button"
                  variant="outline-danger"
                  className="w-100"
                  onClick={() => removeEducation(index)}
                  disabled={formData.educations.length <= 1}
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
            disabled={formData.educations.length >= MAX_ROWS}
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
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    id={`work-company-${index}`}
                    type="text"
                    value={workExperience.company}
                    onChange={(event) => updateExperience(index, 'company', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId={`work-position-${index}`}>
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    id={`work-position-${index}`}
                    type="text"
                    value={workExperience.position}
                    onChange={(event) => updateExperience(index, 'position', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId={`work-description-${index}`}>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    id={`work-description-${index}`}
                    as="textarea"
                    rows={2}
                    value={workExperience.description}
                    onChange={(event) =>
                      updateExperience(index, 'description', event.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`work-startDate-${index}`}>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    id={`work-startDate-${index}`}
                    type="date"
                    value={workExperience.startDate}
                    onChange={(event) => updateExperience(index, 'startDate', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId={`work-endDate-${index}`}>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    id={`work-endDate-${index}`}
                    type="date"
                    value={workExperience.endDate}
                    onChange={(event) => updateExperience(index, 'endDate', event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="button"
                  variant="outline-danger"
                  className="w-100"
                  onClick={() => removeExperience(index)}
                  disabled={formData.workExperiences.length <= 1}
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
            disabled={formData.workExperiences.length >= MAX_ROWS}
          >
            Add Experience
          </Button>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="h4">CV Upload</legend>
          <Form.Group controlId="cvFile">
            <Form.Label>Upload CV (PDF or DOCX)</Form.Label>
            <Form.Control id="cvFile" type="file" accept=".pdf,.docx" onChange={handleFileChange} />
            <Form.Text>
              Accepted formats: PDF or DOCX. Maximum size: {MAX_FILE_SIZE_MB} MB.
            </Form.Text>
          </Form.Group>

          {fileError ? (
            <Alert variant="danger" className="mt-3 mb-0">
              {fileError}
            </Alert>
          ) : null}

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
              <Button type="button" variant="outline-secondary" onClick={clearFile}>
                Clear File
              </Button>
            </div>
          ) : null}
        </fieldset>

        <Button type="button" variant="primary">
          Continue
        </Button>
      </Form>
    </Container>
  );
};

export default AddCandidate;
