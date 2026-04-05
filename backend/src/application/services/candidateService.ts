import { PrismaClient } from '@prisma/client';
import { CandidateValidator } from '../validators/candidateValidator';
import {
  CreateCandidatePayload,
  CandidateResponseDTO,
} from '../dto/candidate.dto';
import {
  ValidationError as DomainValidationError,
  DuplicateEmailError,
} from '../../domain/errors';
import { sanitizeString, sanitizePath } from '../../infrastructure/security';

export class CandidateService {
  private prisma: PrismaClient;
  private validator: CandidateValidator;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.validator = new CandidateValidator();
  }

  /**
   * Create a candidate with education, work experience, and resume in a transaction.
   * Throws domain errors on validation or business rule violations.
   * Ensures atomicity: all-or-nothing.
   */
  async createCandidate(
    payload: CreateCandidatePayload
  ): Promise<CandidateResponseDTO> {
    // Step 1: Sanitize string inputs
    const sanitized: CreateCandidatePayload = {
      ...payload,
      firstName: sanitizeString(payload.firstName),
      lastName: sanitizeString(payload.lastName),
      email: sanitizeString(payload.email),
      phone: payload.phone ? sanitizeString(payload.phone) : undefined,
      address: payload.address ? sanitizeString(payload.address) : undefined,
      cvFilePath: payload.cvFilePath
        ? sanitizePath(payload.cvFilePath)
        : undefined,
      educations: payload.educations?.map((edu) => ({
        ...edu,
        institution: sanitizeString(edu.institution),
        title: sanitizeString(edu.title),
      })),
      workExperiences: payload.workExperiences?.map((exp) => ({
        ...exp,
        company: sanitizeString(exp.company),
        position: sanitizeString(exp.position),
        description: sanitizeString(exp.description),
      })),
    };

    // Step 2: Validate personal info
    const personalInfoErrors = this.validator.validatePersonalInfo({
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      email: sanitized.email,
      phone: sanitized.phone,
      address: sanitized.address,
    });

    // Step 3: Validate education entries
    const educationErrors: Array<{ field: string; message: string }> = [];
    if (sanitized.educations && sanitized.educations.length > 0) {
      sanitized.educations.forEach((edu, index) => {
        const errors = this.validator.validateEducation(edu);
        errors.forEach((err) => {
          educationErrors.push({
            field: `educations[${index}].${err.field}`,
            message: err.message,
          });
        });
      });
    }

    // Step 4: Validate work experience entries
    const workExperienceErrors: Array<{ field: string; message: string }> = [];
    if (sanitized.workExperiences && sanitized.workExperiences.length > 0) {
      sanitized.workExperiences.forEach((exp, index) => {
        const errors = this.validator.validateWorkExperience(exp);
        errors.forEach((err) => {
          workExperienceErrors.push({
            field: `workExperiences[${index}].${err.field}`,
            message: err.message,
          });
        });
      });
    }

    const allErrors = [
      ...personalInfoErrors,
      ...educationErrors,
      ...workExperienceErrors,
    ];
    if (allErrors.length > 0) {
      throw new DomainValidationError('Validation failed', allErrors);
    }

    // Step 5: Execute atomic transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Check for duplicate email inside transaction to prevent races
      const existingCandidate = await tx.candidate.findUnique({
        where: { email: sanitized.email },
      });

      if (existingCandidate) {
        throw new DuplicateEmailError(sanitized.email);
      }

      // Create candidate
      const candidate = await tx.candidate.create({
        data: {
          firstName: sanitized.firstName,
          lastName: sanitized.lastName,
          email: sanitized.email,
          phone: sanitized.phone || null,
          address: sanitized.address || null,
        },
      });

      // Create education records if provided
      if (sanitized.educations && sanitized.educations.length > 0) {
        await tx.education.createMany({
          data: sanitized.educations.map((edu) => ({
            institution: edu.institution,
            title: edu.title,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            candidateId: candidate.id,
          })),
        });
      }

      // Create work experience records if provided
      if (sanitized.workExperiences && sanitized.workExperiences.length > 0) {
        await tx.workExperience.createMany({
          data: sanitized.workExperiences.map((exp) => ({
            company: exp.company,
            position: exp.position,
            description: exp.description,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            candidateId: candidate.id,
          })),
        });
      }

      // Create resume record if file path provided
      if (sanitized.cvFilePath) {
        await tx.resume.create({
          data: {
            filePath: sanitized.cvFilePath,
            fileType: payload.cvFileType || 'application/pdf',
            fileSize: payload.cvFileSize || 0,
            candidateId: candidate.id,
          },
        });
      }

      return candidate;
    });

    // Step 6: Return clean response DTO
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      phone: result.phone || undefined,
      address: result.address || undefined,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * Retrieve a candidate by ID with all related data (optional, for future use)
   */
  async getCandidateById(id: string): Promise<CandidateResponseDTO | null> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) return null;

    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone || undefined,
      address: candidate.address || undefined,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  }
}
