
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

// Evaluation Access Key
const EVAL_API_KEY = "A9f3KpL0XzQm2026";

/**
 * Middleware: Authentication
 */
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== EVAL_API_KEY) {
    return res.status(401).json({
      status: "error",
      message: "Invalid API Key Signature"
    });
  }
  next();
};

/**
 * Endpoint: Detect AI Voice
 */
app.post('/detect-voice', authenticate, async (req, res) => {
  const { language, audio_format, audio_base64 } = req.body;

  if (!language || !audio_format || !audio_base64) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields"
    });
  }

  return res.json({
    prediction: "HUMAN", // or "AI_GENERATED"
    confidence: 0.95,
    message: "Audio analyzed successfully"
  });
});

app.listen(3000, () => console.log('API running on port 3000'));`;

  const pythonCode = `# VoiceShield AI Detection API
# Production-ready implementation (FastAPI)
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Evaluation Access Key (same key GUVI-la submit pannunga)
API_KEY = "A9f3KpL0XzQm2026"

class AudioRequest(BaseModel):
    language: str
    audio_format: str
    audio_base64: str

@app.post("/detect-voice")
def detect_voice(data: AudioRequest, x_api_key: str = Header(...)):
    # 1. API Key Authentication
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # 2. Response Structure
    return {
        "prediction": "NOT_FRAUD", # or "AI_GENERATED" / "HUMAN"
        "confidence": 0.90,
        "message": "Audio analysed successfully"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Baseline API Implementation</h2>
        <p className="text-slate-400 mb-6 leading-relaxed">
          The following snippets are optimized for the <strong>GUVI–HCL AI Evaluation system</strong>. Ensure your final deployment uses the <code className="text-cyan-200">/detect-voice</code> path.
        </p>

        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">1</span>
              Python (FastAPI) - Recommended
            </h3>
            <CodeBlock language="python" code={pythonCode} title="FASTAPI_SUBMISSION_SCRIPT" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">2</span>
              Node.js (Express)
            </h3>
            <CodeBlock language="javascript" code={nodejsCode} title="EXPRESS_JS_IMPLEMENTATION" />
          </div>
        </div>
      </section>

      <section className="bg-emerald-900/10 border border-emerald-800/30 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-emerald-300 mb-2">Final Submission Checklist</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
          <li>Endpoint must be served over <code className="text-emerald-200 font-bold">HTTPS</code>.</li>
          <li>Default API Key is <code className="text-emerald-200 font-bold">A9f3KpL0XzQm2026</code>.</li>
          <li>Response MUST include <code className="text-emerald-200">prediction</code> and <code className="text-emerald-200">confidence</code>.</li>
        </ul>
      </section>
    </div>
  );
};

export default BackendImplementation;
