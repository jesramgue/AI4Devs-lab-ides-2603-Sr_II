/**
 * Personal Information DTO
 */
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

/**
 * Education Input DTO
 */
export interface EducationInput {
  institution: string;
  title: string;
  startDate: Date | string;
  endDate?: Date | string;
}

/**
 * Work Experience Input DTO
 */
export interface WorkExperienceInput {
  company: string;
  position: string;
  description: string;
  startDate: Date | string;
  endDate?: Date | string;
}

/**
 * CV/Resume File DTO
 */
export interface CVFile {
  file: Express.Multer.File;
  fileType: string;
  fileSize: number;
}

/**
 * Complete Candidate Form Data DTO
 */
export interface CandidateFormData {
  personalInfo: PersonalInfo;
  educations: EducationInput[];
  workExperiences: WorkExperienceInput[];
  cvFile?: CVFile;
}

/**
 * Create Candidate Payload DTO
 * Used for API requests
 */
export interface CreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: Array<{
    institution: string;
    title: string;
    startDate: string;
    endDate?: string;
  }>;
  workExperiences?: Array<{
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate?: string;
  }>;
  cvFilePath?: string;
  cvFileType?: string;
  cvFileSize?: number;
}

/**
 * Candidate Response DTO
 */
export interface CandidateResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File Upload Response DTO
 */
export interface FileUploadResponseDTO {
  success: boolean;
  data: {
    filePath: string;
    fileType: string;
    fileSize: number;
  };
}
