
import React from 'react';
import CodeBlock from './CodeBlock';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Authentication</h2>
        <p className="text-slate-400 mb-4">
          All API requests must include the evaluation key in the <code className="text-cyan-300 bg-slate-800 px-1 rounded">x-api-key</code> HTTP header.
        </p>
        <CodeBlock 
          language="http"
          code={`POST /detect-voice HTTP/1.1\nHost: your-api.domain.com\nx-api-key: A9f3KpL0XzQm2026`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Endpoint Definition</h2>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">POST</span>
            <code className="text-slate-200">/detect-voice</code>
          </div>
          <p className="text-sm text-slate-400">Main forensic gateway for AI voice classification.</p>
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
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Standard Response Format</h2>
        <p className="text-sm text-slate-400 mb-4">The system expects a flat JSON structure for rapid diagnostic processing.</p>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-md font-semibold mb-2 text-green-400">Expected Success Schema</h3>
            <CodeBlock 
              language="json"
              code={`{
  "prediction": "AI_GENERATED",
  "confidence": 0.90,
  "message": "Audio analysed successfully"
}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
