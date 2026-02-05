
import React from 'react';
import CodeBlock from './CodeBlock';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Authentication</h2>
        <p className="text-slate-400 mb-4">
          All API requests must include your API Key in the <code className="text-cyan-300 bg-slate-800 px-1 rounded">x-api-key</code> HTTP header.
        </p>
        <CodeBlock 
          language="http"
          code={`POST /v1/detect HTTP/1.1\nHost: api.voiceshield.ai\nx-api-key: YOUR_SECRET_API_KEY`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Endpoint Definition</h2>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">POST</span>
            <code className="text-slate-200">/v1/detect</code>
          </div>
          <p className="text-sm text-slate-400">Analyzes audio forensics to classify voice authenticity.</p>
        </div>

        <h3 className="text-lg font-semibold mb-3 text-slate-200">Request Body (JSON)</h3>
        <CodeBlock 
          language="json"
          code={`{
  "language": "en-US",
  "audio_format": "mp3",
  "audio_base64": "UklGRuY6AABXQVZFZm10IBIAAAABAAEARKwAAIhYA..." 
}`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Response Format</h2>
        <p className="text-sm text-slate-400 mb-4">The API returns a structured JSON object containing classification and forensic reasoning.</p>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-md font-semibold mb-2 text-green-400">Success Schema (200 OK)</h3>
            <CodeBlock 
              language="json"
              code={`{
  "status": "success",
  "prediction": "AI_GENERATED",
  "confidence": 0.942,
  "details": {
    "reasoning": "Detected high-frequency spectral repetition and unnatural lack of sibilance micro-variations consistent with neural vocoding artifacts.",
    "detected_language": "en-US"
  }
}`}
            />
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2 text-red-400">Error Schema (429/401)</h3>
            <CodeBlock 
              language="json"
              code={`{
  "status": "error",
  "prediction": "HUMAN",
  "confidence": 0,
  "message": "API Rate Limit Exceeded: You've reached the Gemini API quota."
}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
