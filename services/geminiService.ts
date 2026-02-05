
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionRequest, DetectionResponse } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Performs a lightweight diagnostic check to verify API key validity and quota.
 */
export const validateApiKey = async (): Promise<{ status: 'valid' | 'invalid' | 'quota_exceeded' | 'error', message?: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Smallest possible request to check connectivity
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'ok',
      config: { maxOutputTokens: 1 }
    });
    return { status: 'valid' };
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    if (errorStr.includes('401') || errorStr.includes('invalid') || errorStr.includes('key')) {
      return { status: 'invalid', message: 'The provided API key is invalid or has been revoked.' };
    }
    if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted')) {
      return { status: 'quota_exceeded', message: 'API Quota Exceeded. Please check your billing at ai.google.dev.' };
    }
    return { status: 'error', message: error.message || 'Unknown connectivity error.' };
  }
};

export const detectVoice = async (request: DetectionRequest): Promise<DetectionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let mimeType = 'audio/mpeg';
    if (request.audio_format === 'wav') mimeType = 'audio/wav';
    
    let base64Data = request.audio_base64;
    if (request.audio_base64.startsWith('data:')) {
      const match = request.audio_base64.match(/^data:([^;]+);base64,/);
      if (match) mimeType = match[1];
      base64Data = request.audio_base64.replace(/^data:[^;]+;base64,/, '');
    }

    const lessonsLearned = request.past_corrections?.length 
      ? `\nLESSONS LEARNED FROM PAST MISTAKES (Avoid repeating these errors):\n${request.past_corrections.map((c, i) => 
          `${i+1}. Previously predicted ${c.original_prediction} but it was actually ${c.actual_label}. Analysis of failure: ${c.reasoning_of_failure}`
        ).join('\n')}`
      : '';

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: `SYSTEM ROLE: Expert Forensic Audio & Linguistic Analyst.
              TASK: Conduct a deep-layer analysis to distinguish between AUTHENTIC HUMAN SPEECH and AI-GENERATED (Synthetic/Deepfake) audio.
              
              CONTEXT:
              - Target Language: ${request.language}
              - Modality: Audio Forensic Analysis
              ${lessonsLearned}

              DIAGNOSTIC CRITERIA:
              1. SPECTRAL ARTIFACTS: Check for "metallic" ringing, pre-echoes, or unnatural silence between phonemes.
              2. PROSODY & CADENCE: Human speech has micro-hesitations. AI often fails at natural emotional inflections or micro-rhythms.
              3. BREATHING PATTERNS: Are breaths missing or perfectly timed?
              4. FORMANTS: In AI clones, formant transitions can appear "smeared".
              
              OUTPUT FORMAT:
              You MUST return a JSON object with:
              - prediction: "AI_GENERATED" if you detect synthetic markers, "HUMAN" otherwise.
              - confidence: Score 0.0 to 1.0.
              - reasoning: Detailed explanation of markers detected.
              - detected_language: Locale detected.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING, enum: ["AI_GENERATED", "HUMAN"] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            detected_language: { type: Type.STRING }
          },
          required: ["prediction", "confidence", "reasoning", "detected_language"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      status: 'success',
      prediction: result.prediction,
      confidence: result.confidence,
      details: {
        reasoning: result.reasoning,
        detected_language: result.detected_language
      }
    };
  } catch (error: any) {
    console.error("Gemini Detection Error:", error);
    
    let message = "Analysis failed. Please try again.";
    const errorStr = JSON.stringify(error).toLowerCase();
    if (errorStr.includes('429') || errorStr.includes('resource_exhausted') || errorStr.includes('quota')) {
      message = "API Rate Limit Exceeded: You've reached the Gemini API quota. Please wait a moment or check your billing plan at ai.google.dev.";
    } else if (errorStr.includes('401') || (errorStr.includes('invalid') && errorStr.includes('key'))) {
      message = "Invalid API Key: Please verify your neural link configuration.";
    } else if (error.message) {
      message = error.message;
    }

    return {
      status: 'error',
      prediction: 'HUMAN',
      confidence: 0,
      message: message
    };
  }
};

export const calibrateModel = async (
  audioBase64: string, 
  originalResponse: DetectionResponse, 
  actualLabel: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            { inlineData: { data: audioBase64.replace(/^data:[^;]+;base64,/, ''), mimeType: 'audio/wav' } },
            {
              text: `DEBUGGING TASK: You previously analyzed this audio and predicted it was ${originalResponse.prediction} with reasoning: "${originalResponse.details?.reasoning}".
              
              THE USER HAS FLAGGED THIS AS INCORRECT. The actual label is: ${actualLabel}.
              
              Please re-examine the audio and identify the specific subtle forensic markers you missed that prove it is ${actualLabel}. Summarize the "lesson learned" in one concise sentence so we can avoid this mistake in the future.`
            }
          ]
        }
      ]
    });

    return response.text || "Unidentified processing artifact.";
  } catch (error: any) {
    console.error("Calibration Error:", error);
    const errorStr = JSON.stringify(error).toLowerCase();
    if (errorStr.includes('429')) {
      return "Calibration failed due to API rate limits. Please try again later.";
    }
    return "Error calibrating model.";
  }
};
