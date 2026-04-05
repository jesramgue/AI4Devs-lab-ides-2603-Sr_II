import { PrismaClient } from '@prisma/client';
import { CandidateValidator, ValidationError } from '../validators/candidateValidator';
import {
  CreateCandidatePayload,
  CandidateResponseDTO,
  EducationInput,
  WorkExperienceInput,
} from '../dto/candidate.dto';

export interface CreateCandidateResult {
  success: boolean;
  data?: CandidateResponseDTO;
  errors?: ValidationError[];
  error?: string;
}

export class CandidateService {
  private prisma: PrismaClient;
  private validator: CandidateValidator;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.validator = new CandidateValidator();
  }

  /**
   * Create a candidate with education, work experience, and resume in a transaction
   * Ensures atomicity: all or nothing
   */
  async createCandidate(
    payload: CreateCandidatePayload
  ): Promise<CreateCandidateResult> {
    // Step 1: Validate personal info
    const personalInfoErrors = this.validator.validatePersonalInfo({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    });

    if (personalInfoErrors.length > 0) {
      return {
        success: false,
        errors: personalInfoErrors,
      };
    }

    // Step 2: Validate education entries
    const educationErrors: ValidationError[] = [];
    if (payload.educations && payload.educations.length > 0) {
      payload.educations.forEach((edu, index) => {
        const errors = this.validator.validateEducation({
          institution: edu.institution,
          title: edu.title,
          startDate: edu.startDate,
          endDate: edu.endDate,
        });
        // Add index to error field for clarity
        errors.forEach((err) => {
          educationErrors.push({
            field: `educations[${index}].${err.field}`,
            message: err.message,
          });
        });
      });
    }

    // Step 3: Validate work experience entries
    const workExperienceErrors: ValidationError[] = [];
    if (payload.workExperiences && payload.workExperiences.length > 0) {
      payload.workExperiences.forEach((exp, index) => {
        const errors = this.validator.validateWorkExperience({
          company: exp.company,
          position: exp.position,
          description: exp.description,
          startDate: exp.startDate,
          endDate: exp.endDate,
        });
        // Add index to error field for clarity
        errors.forEach((err) => {
          workExperienceErrors.push({
            field: `workExperiences[${index}].${err.field}`,
            message: err.message,
          });
        });
      });
    }

    // Combine all validation errors
    const allErrors = [...educationErrors, ...workExperienceErrors];
    if (allErrors.length > 0) {
      return {
        success: false,
        errors: allErrors,
      };
    }

    // Step 4: Execute atomic transaction
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Check for duplicate email
        const existingCandidate = await tx.candidate.findUnique({
          where: { email: payload.email },
        });

        if (existingCandidate) {
          throw new Error('Candidate with this email already exists');
        }

        // Create candidate
        const candidate = await tx.candidate.create({
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone || null,
            address: payload.address || null,
          },
        });

        // Create education records if provided
        if (payload.educations && payload.educations.length > 0) {
          await tx.education.createMany({
            data: payload.educations.map((edu) => ({
              institution: edu.institution,
              title: edu.title,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              candidateId: candidate.id,
            })),
          });
        }

        // Create work experience records if provided
        if (payload.workExperiences && payload.workExperiences.length > 0) {
          await tx.workExperience.createMany({
            data: payload.workExperiences.map((exp) => ({
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
        if (payload.cvFilePath) {
          await tx.resume.create({
            data: {
              filePath: payload.cvFilePath,
              fileType: 'application/pdf', // Default, could be enhanced
              fileSize: 0, // Would need to be passed in payload or fetched
              candidateId: candidate.id,
            },
          });
        }

        return candidate;
      });

      // Step 5: Return response DTO
      return {
        success: true,
        data: {
          id: result.id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          phone: result.phone || undefined,
          address: result.address || undefined,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create candidate';

      // Handle specific error cases
      if (errorMessage.includes('already exists')) {
        return {
          success: false,
          error: 'A candidate with this email already exists',
        };
      }

      // For any transaction error, return generic message
      return {
        success: false,
        error: 'Failed to create candidate. Please try again.',
      };
    }
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
