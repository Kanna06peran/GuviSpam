
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionRequest, DetectionResponse } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const detectVoice = async (request: DetectionRequest): Promise<DetectionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const mimeType = request.audio_format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: request.audio_base64,
                mimeType: mimeType
              }
            },
            {
              text: `Analyze the provided audio sample carefully for signs of AI generation.
              Focus on detecting Text-to-Speech (TTS) artifacts, spectral inconsistencies, robotic cadence, or unnatural prosody.
              
              The primary language context is: ${request.language}. 
              If the language is Telugu or Malayalam, pay close attention to the natural flow of retroflex consonants and vowel elongations which are often flattened in synthetic models.
              
              You MUST respond with a valid JSON object matching this schema:
              {
                "prediction": "AI_GENERATED" | "HUMAN",
                "confidence": number (between 0 and 1),
                "reasoning": "Brief explanation focused on acoustic artifacts or natural vocal traits found",
                "detected_language": "The specific language detected (e.g., Telugu, Malayalam, English)"
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
      message: error instanceof Error ? error.message : "Failed to process audio analysis."
    };
  }
};
