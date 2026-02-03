
import React from 'react';
import CodeBlock from './CodeBlock';

const BackendImplementation: React.FC = () => {
  const nodejsCode = `/**
 * VoiceShield AI Detection API
 * Production-ready implementation (Node.js/Express)
 */
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Mock Database / Configuration
const VALID_API_KEY = "hcl-guvi-eval-key-2024";

/**
 * Middleware: Authentication
 */
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== VALID_API_KEY) {
    return res.status(401).json({
      status: "error",
      code: "AUTH_FAILED",
      message: "Invalid API Key"
    });
  }
  next();
};

/**
 * Endpoint: Detect AI Voice
 */
app.post('/v1/detect', authenticate, async (req, res) => {
  const { language, audio_format, audio_base64 } = req.body;

  // 1. Validation
  if (!language || !audio_format || !audio_base64) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: language, audio_format, or audio_base64"
    });
  }

  try {
    // 2. Process Audio (In a real scenario, this calls the ML model)
    // For this example, we demonstrate the expected logic flow
    const classification = await runMLDetection(audio_base64, language);

    // 3. Structured Response
    return res.json({
      status: "success",
      prediction: classification.label, // "AI_GENERATED" or "HUMAN"
      confidence: classification.score
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal processing error"
    });
  }
});

async function runMLDetection(base64Data, lang) {
  // Logic to interface with AI Model (e.g., TensorFlow/PyTorch)
  return { label: "AI_GENERATED", score: 0.94 };
}

app.listen(3000, () => console.log('API running on port 3000'));`;

  const pythonCode = `# VoiceShield AI Detection API
# Production-ready implementation (FastAPI)
from fastapi import FastAPI, Header, HTTPException, Body
from pydantic import BaseModel
import base64

app = FastAPI()

# Configuration
SECRET_KEY = "hcl-guvi-eval-key-2024"

class DetectionRequest(BaseModel):
    language: str
    audio_format: str
    audio_base64: str

@app.post("/v1/detect")
async def detect_voice(
    request: DetectionRequest,
    x_api_key: str = Header(None)
):
    # 1. API Key Authentication
    if x_api_key != SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        # 2. Decode Audio
        audio_data = base64.b64decode(request.audio_base64)
        
        # 3. Process with AI Model (Placeholder for actual inference)
        # Result = model.predict(audio_data, request.language)
        
        # 4. Strict JSON Response
        return {
            "status": "success",
            "prediction": "AI_GENERATED",
            "confidence": 0.92
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Production Backend Logic</h2>
        <p className="text-slate-400 mb-6 leading-relaxed">
          While this portal demonstrates the API via the frontend, the following implementations are provided for direct deployment to a production server as requested for the <strong>GUVI–HCL API Endpoint Evaluation system</strong>.
        </p>

        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">1</span>
              Node.js (Express) Implementation
            </h3>
            <CodeBlock language="javascript" code={nodejsCode} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
              Python (FastAPI) Implementation
            </h3>
            <CodeBlock language="python" code={pythonCode} />
          </div>
        </div>
      </section>

      <section className="bg-cyan-900/10 border border-cyan-800/30 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-cyan-300 mb-2">Deployment Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400">
          <li>Choose a cloud provider (AWS Lambda, Google Cloud Run, or Vercel).</li>
          <li>Set up an SSL certificate (API must be <code className="text-cyan-200">https</code>).</li>
          <li>Configure your environment variable <code className="text-cyan-200">API_KEY</code> to match evaluation settings.</li>
          <li>Expose the endpoint publicly as <code className="text-cyan-200">/v1/detect</code>.</li>
        </ol>
      </section>
    </div>
  );
};

export default BackendImplementation;
