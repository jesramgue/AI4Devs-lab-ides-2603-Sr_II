export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Education {
  institution: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CVFile {
  file: File | null;
  fileType: string;
  fileSize: number;
}

export interface CandidateFormData {
  personalInfo: PersonalInfo;
  educations: Education[];
  workExperiences: WorkExperience[];
  cvFile: CVFile;
}

export interface CreateCandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: Array<{
    institution: string;
    title: string;
    startDate: string;
    endDate?: string;
  }>;
  workExperiences: Array<{
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate?: string;
  }>;
  cvFilePath?: string;
}

export interface UploadCVResponse {
  success: boolean;
  data: {
    filePath: string;
    fileType: string;
    fileSize: number;
  };
}
