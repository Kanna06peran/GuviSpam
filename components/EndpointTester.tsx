
import React, { useState } from 'react';
import CodeBlock from './CodeBlock.tsx';

const EVAL_ACCESS_KEY = "A9f3KpL0XzQm2026";

const EndpointTester: React.FC = () => {
  // Authorization State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [authError, setAuthError] = useState(false);

  // Tester Form State
  const [apiKey, setApiKey] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [format, setFormat] = useState("mp3");
  const [base64, setBase64] = useState("");
  
  // Execution State
  const [isTesting, setIsTesting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (authKey === EVAL_ACCESS_KEY) {
      setIsAuthorized(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const runTest = async () => {
    if (!url || !apiKey || !base64) {
      setTestError("Please fill in all required fields marked with *");
      return;
    }

    setIsTesting(true);
    setTestError(null);
    setResponse(null);
    const startTime = performance.now();

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          language,
          audio_format: format,
          audio_base64: base64
        })
      });

      const data = await res.json();
      const endTime = performance.now();
      
      setLatency(Math.round(endTime - startTime));
      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: data
      });
    } catch (err: any) {
      setTestError(`Network failure: ${err.message}. Ensure the endpoint supports CORS and is reachable via HTTPS.`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-1000">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden group text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="mb-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Endpoint Tester Access</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Evaluation Verification Required</p>
          </div>
          <form onSubmit={handleAuthorize} className="space-y-4">
            <input 
              type="password" 
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="••••••••••••••••"
              className={`w-full bg-slate-950 border ${authError ? 'border-red-500 animate-shake' : 'border-slate-800'} rounded-xl px-5 py-4 text-center text-lg tracking-[0.5em] text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all font-mono`}
            />
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]">Unlock Integration Portal</button>
          </form>
          {authError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 animate-in fade-in slide-in-from-top-1">Verification Failed</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">AI-Generated Voice Detection – <span className="text-cyan-400">API Endpoint Tester</span></h2>
        <p className="text-slate-500 text-sm mt-1">Validate authentication, request handling, and schema compliance for your deployed API.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Configuration */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Headers & Routing
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">x-api-key *</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your secret API key"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Endpoint URL *</label>
                <input 
                  type="url" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-api-endpoint.com/v1/detect"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Request Body Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Language *</label>
                <input 
                  type="text" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. en-US"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Audio Format *</label>
                <input 
                  type="text" 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  placeholder="e.g. mp3 or wav"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Audio Base64 Format *</label>
              <textarea 
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                placeholder="Paste the raw base64 encoded audio string here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-slate-400 focus:outline-none focus:border-cyan-500/50 min-h-[160px] resize-none"
              />
            </div>

            <button 
              onClick={runTest}
              disabled={isTesting}
              className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Dispatching Request...
                </>
              ) : (
                'Test Deployed Endpoint'
              )}
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col min-h-[600px] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
           
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
             <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Network Diagnostic Log</h3>
             {latency && (
               <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-800/50 uppercase">
                 LATENCY: {latency}ms
               </span>
             )}
           </div>

           <div className="flex-grow">
              {testError && (
                <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
                  <p className="text-red-400 text-xs font-bold leading-relaxed">{testError}</p>
                </div>
              )}

              {response ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="flex items-center gap-4">
                      <div className={`px-3 py-1.5 rounded-lg font-black text-sm border ${response.status >= 200 && response.status < 300 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                        HTTP {response.status}
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Server Context: {response.statusText || 'Parsed'}</p>
                   </div>
                   
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Response JSON Schema Output</p>
                     <CodeBlock 
                       language="json" 
                       title="EXTERNAL_RESPONSE_BODY"
                       code={JSON.stringify(response.body, null, 2)} 
                     />
                   </div>

                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Compliance Audit</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'prediction', label: 'Field: prediction (HUMAN/AI_GENERATED/NOT_FRAUD)' },
                          { key: 'confidence', label: 'Field: confidence (number 0-1)' }
                        ].map(field => (
                          <div key={field.key} className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">{field.label}</span>
                            {response.body[field.key] !== undefined ? (
                              <span className="text-emerald-400 font-bold uppercase">PASSED</span>
                            ) : (
                              <span className="text-orange-500 font-bold uppercase">MISSING</span>
                            )}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              ) : !testError ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Dispatch</p>
                </div>
              ) : null}
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EndpointTester;
