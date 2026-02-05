
export type AudioFormat = 'mp3' | 'wav';

export interface Correction {
  original_prediction: string;
  actual_label: string;
  reasoning_of_failure: string;
}

export interface DetectionRequest {
  language: string;
  audio_format: AudioFormat;
  audio_base64: string;
  past_corrections?: Correction[];
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
  SANDBOX = 'SANDBOX'
}
