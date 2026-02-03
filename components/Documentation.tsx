
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
          code={`GET /v1/detect HTTP/1.1\nHost: api.voiceshield.ai\nx-api-key: YOUR_SECRET_API_KEY`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Endpoint Definition</h2>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">POST</span>
            <code className="text-slate-200">/v1/detect</code>
          </div>
          <p className="text-sm text-slate-400">Classifies whether an audio sample is AI-generated or Human-generated.</p>
        </div>

        <h3 className="text-lg font-semibold mb-3 text-slate-200">Request Body</h3>
        <CodeBlock 
          language="json"
          code={`{
  "language": "en-US",
  "audio_format": "mp3",
  "audio_base64": "SGVsbG8gd29ybGQuLi4=" // Base64 encoded audio
}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-sm font-bold uppercase text-slate-500 mb-2">Properties</h4>
            <ul className="space-y-3">
              <li className="flex flex-col">
                <span className="text-cyan-300 font-mono">language <span className="text-slate-500 font-sans text-xs">(string)</span></span>
                <span className="text-xs text-slate-400">The primary language spoken in the audio.</span>
              </li>
              <li className="flex flex-col">
                <span className="text-cyan-300 font-mono">audio_format <span className="text-slate-500 font-sans text-xs">(enum)</span></span>
                <span className="text-xs text-slate-400">The file encoding: "mp3" or "wav".</span>
              </li>
              <li className="flex flex-col">
                <span className="text-cyan-300 font-mono">audio_base64 <span className="text-slate-500 font-sans text-xs">(string)</span></span>
                <span className="text-xs text-slate-400">The raw audio data in Base64 format.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Response Formats</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold mb-2 text-green-400">Success (200 OK)</h3>
            <CodeBlock 
              language="json"
              code={`{
  "status": "success",
  "prediction": "AI_GENERATED",
  "confidence": 0.98
}`}
            />
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2 text-red-400">Error (401 Unauthorized)</h3>
            <CodeBlock 
              language="json"
              code={`{
  "status": "error",
  "code": "AUTH_INVALID",
  "message": "The provided API key is invalid or expired."
}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
