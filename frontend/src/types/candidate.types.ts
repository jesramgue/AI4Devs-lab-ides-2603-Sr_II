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
