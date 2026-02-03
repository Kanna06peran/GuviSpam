
export type AudioFormat = 'mp3' | 'wav';

export interface DetectionRequest {
  language: string;
  audio_format: AudioFormat;
  audio_base64: string;
}

export interface DetectionResponse {
  status: 'success' | 'error';
  prediction: 'AI_GENERATED' | 'HUMAN';
  confidence: number;
  message?: string;
  details?: {
    reasoning: string;
    detected_language: string;
  };
}

export interface ApiError {
  status: 'error';
  code: string;
  message: string;
}

export enum AppTab {
  OVERVIEW = 'OVERVIEW',
  DOCS = 'DOCS',
  SANDBOX = 'SANDBOX',
  BACKEND_CODE = 'BACKEND_CODE'
}
