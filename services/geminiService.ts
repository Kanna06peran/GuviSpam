
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionRequest, DetectionResponse } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const detectVoice = async (request: DetectionRequest): Promise<DetectionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Determine MIME type based on format or provided type
    let mimeType = 'audio/mpeg';
    if (request.audio_format === 'wav') mimeType = 'audio/wav';
    if (request.audio_base64.startsWith('data:')) {
      // If it's a data URI, extract the mime type
      const match = request.audio_base64.match(/^data:([^;]+);base64,/);
      if (match) mimeType = match[1];
    }
    
    // Clean base64 data if it contains a prefix
    const base64Data = request.audio_base64.replace(/^data:[^;]+;base64,/, '');

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
              text: `SYSTEM ROLE: Forensic Audio Analyst
              TASK: Determine if the provided audio is AI-GENERATED (TTS/Voice Clone) or HUMAN.
              
              CONTEXT: 
              - Language: ${request.language}
              - Focus: Look for "robotic" cadence, lack of emotional micro-fluctuations, and spectral discontinuities.
              
              REGIONAL ANALYSIS (CRITICAL):
              If the language is Telugu (te-IN) or Malayalam (ml-IN), specifically examine:
              1. Retroflex Consonants (ట, డ, ణ / ട, ഡ, ണ): Synthetic voices often fail to produce the distinct 'tongue curl' acoustics.
              2. Vowel Sandhi: Check for natural fluid transitions between words.
              3. Aspirated sounds: AI often makes these too uniform or skips the breathy quality.

              OUTPUT: You MUST respond with a valid JSON object.
              {
                "prediction": "AI_GENERATED" | "HUMAN",
                "confidence": number (0-1),
                "reasoning": "Explain acoustic markers found",
                "detected_language": "Specific locale found"
              }`
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
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return {
      status: 'error',
      prediction: 'HUMAN',
      confidence: 0,
      message: error instanceof Error ? error.message : "Failed to analyze audio sample."
    };
  }
};
