import axios, { AxiosInstance } from 'axios';

import { CreateCandidatePayload, UploadCVResponse } from '../types/candidate.types';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3010',
  timeout: 15000,
});

export const uploadCV = async (file: File): Promise<UploadCVResponse['data']> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadCVResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

export const createCandidate = async (payload: CreateCandidatePayload): Promise<unknown> => {
  const response = await apiClient.post('/candidates', payload);
  return response.data;
};
