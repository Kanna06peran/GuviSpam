
import React, { useState, useRef, useEffect } from 'react';
import { detectVoice, calibrateModel } from '../services/geminiService.ts';
import { DetectionRequest, DetectionResponse, AudioFormat, Correction } from '../types.ts';
import CodeBlock from './CodeBlock.tsx';

const EVAL_ACCESS_KEY = "A9f3KpL0XzQm2026";

const Sandbox: React.FC = () => {
  // Authorization State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [authError, setAuthError] = useState(false);

  const [language, setLanguage] = useState('en-US');
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<DetectionResponse | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastBase64, setLastBase64] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  
  // Manual Base64 Input State
  const [manualBase64, setManualBase64] = useState("");
  
  // Adaptive Learning State
  const [pastCorrections, setPastCorrections] = useState<Correction[]>([]);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'confirmed' | 'learning'>('idle');

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingStep, setLoadingStep] = useState('');

  const loadingSteps = [
    "Initializing neural forensic engine...",
    "Extracting spectral fingerprints...",
    "Analyzing prosodic micro-variations...",
    "Checking session training history...",
    "Evaluating linguistic authenticity...",
    "Finalizing diagnostic report..."
  ];

  useEffect(() => {
    let interval: number;
    if (isProcessing) {
      let step = 0;
      setLoadingStep(loadingSteps[0]);
      interval = window.setInterval(() => {
        step = (step + 1) % loadingSteps.length;
        setLoadingStep(loadingSteps[step]);
      }, 1500);
    }
    return () => window.clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = async () => {
    // Only allow microphone access after authorization
    if (!isAuthorized) return;
    setFileError(null);
    setResponse(null);
    setFeedbackStatus('idle');
    setPreviewUrl(null);
    setManualBase64("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setPreviewUrl(url);
        processAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setFileError(`Microphone error: ${err.message || "Access denied"}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioBlob = async (blob: Blob) => {
    setIsProcessing(true);
    setFileError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setLastBase64(base64String);
        await performDetection(base64String, 'wav');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setFileError("Error processing audio stream.");
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthorized) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setResponse(null);
    setFeedbackStatus('idle');
    setManualBase64("");
    setPreviewUrl(URL.createObjectURL(file));

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setLastBase64(base64String);
        await performDetection(base64String, audioFormat);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFileError("Failed to read file.");
      setIsProcessing(false);
    }
  };

  const handleBase64Submit = async () => {
    if (!manualBase64.trim()) return;
    setFileError(null);
    setResponse(null);
    setFeedbackStatus('idle');
    setPreviewUrl(null);
    setIsProcessing(true);

    try {
      let base64String = manualBase64.trim();
      let format = audioFormat;
      
      if (base64String.startsWith('data:audio/')) {
        const match = base64String.match(/^data:audio\/([^;]+);base64,/);
        if (match) format = match[1] as AudioFormat;
        base64String = base64String.replace(/^data:audio\/[^;]+;base64,/, '');
      }

      setLastBase64(base64String);
      await performDetection(base64String, format);
    } catch (err) {
      setFileError("Invalid base64 string format.");
      setIsProcessing(false);
    }
  };

  const performDetection = async (base64: string, format: string) => {
    const payload: DetectionRequest = {
      language,
      audio_format: format as AudioFormat,
      audio_base64: base64,
      past_corrections: pastCorrections
    };
    const result = await detectVoice(payload);
    if (result.status === 'error') {
      setFileError(result.message || "Analysis failed.");
    } else {
      setResponse(result);
    }
    setIsProcessing(false);
  };

  const handleManualFeedback = async (label: 'HUMAN' | 'AI_GENERATED') => {
    if (!response || !lastBase64) return;
    if (label === response.prediction) {
      setFeedbackStatus('confirmed');
      return;
    }

    setFeedbackStatus('learning');
    try {
      const failureReasoning = await calibrateModel(lastBase64, response, label);
      const newCorrection: Correction = {
        original_prediction: response.prediction,
        actual_label: label,
        reasoning_of_failure: failureReasoning
      };
      setPastCorrections(prev => [...prev, newCorrection]);
      setFeedbackStatus('idle');
      setResponse({
        ...response,
        prediction: label,
        confidence: 1.0,
        details: {
            ...response.details!,
            reasoning: `[NEURAL CORRECTION APPLIED]: ${failureReasoning}`
        }
      });
    } catch (err) {
      setFeedbackStatus('idle');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-1000">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Evaluation Access Required</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Enter Portal Verification Key</p>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-4">
            <input 
              type="password" 
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="••••••••••••••••"
              className={`w-full bg-slate-950 border ${authError ? 'border-red-500 animate-shake' : 'border-slate-800'} rounded-xl px-5 py-4 text-center text-lg tracking-[0.5em] text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all font-mono`}
            />
            <button 
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
            >
              Verify & Unlock Portal
            </button>
          </form>

          {authError && (
            <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 animate-in fade-in slide-in-from-top-1">Invalid Key Signature</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div className="space-y-6">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white uppercase tracking-widest text-sm">
              Input Parameters
            </h3>
            <div className="flex items-center gap-1.5 bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Authorized Access</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Context Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-300">
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (Standard)</option>
                <option value="te-IN">Telugu (Regional Analysis)</option>
                <option value="ml-IN">Malayalam (Regional Analysis)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Format</label>
              <select value={audioFormat} onChange={(e) => setAudioFormat(e.target.value as AudioFormat)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-300">
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white uppercase tracking-widest text-sm">
            Capture Signal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 mb-6">
            <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 ${isRecording ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 cursor-pointer'}`} onClick={isRecording ? stopRecording : startRecording}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
                {isRecording ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth={2} /></svg>}
              </div>
              <p className="text-[10px] font-black uppercase text-white tracking-widest">{isRecording ? 'Stop' : 'Record'}</p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-4" onClick={() => fileInputRef.current?.click()}>
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-[10px] font-black uppercase text-white tracking-widest">Upload</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".mp3,.wav" className="hidden" />
            </div>
          </div>

          <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Manual Base64 Signal Entry</h4>
             <textarea 
               value={manualBase64}
               onChange={(e) => setManualBase64(e.target.value)}
               placeholder="Paste base64 audio string or data URI here..."
               className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-cyan-500 focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none"
             />
             <button 
               onClick={handleBase64Submit}
               disabled={!manualBase64.trim() || isProcessing}
               className="mt-4 w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all"
             >
               Process Base64 Signal
             </button>
          </div>

          {fileError && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span className="font-bold leading-tight uppercase tracking-tight">{fileError}</span>
            </div>
          )}

          {previewUrl && (
            <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
               <audio src={previewUrl} controls className="w-full h-8 opacity-70" />
            </div>
          )}

          {isProcessing && (
            <div className="mt-6 flex flex-col items-center p-8 bg-slate-950/80 rounded-2xl border border-cyan-500/20">
              <div className="w-12 h-12 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-cyan-400 font-black text-[10px] uppercase tracking-widest">{loadingStep}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/80 rounded-3xl p-8 border border-slate-800 min-h-[580px] flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800 relative z-10">
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tighter">AI Forensics Diagnostic</h3>
            {response && (
                <button 
                  onClick={() => setShowJson(!showJson)}
                  className={`text-[10px] px-3 py-1 rounded-full font-black border transition-colors ${showJson ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                >
                  {showJson ? 'VIEW VISUALS' : 'VIEW RAW JSON'}
                </button>
            )}
          </div>

          <div className="flex-grow relative z-10">
            {response ? (
              showJson ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Official API JSON Response Payload</p>
                   <CodeBlock 
                     language="json" 
                     title="API_RESULT_PAYLOAD"
                     code={JSON.stringify(response, null, 2)} 
                   />
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Classification Confidence</p>
                      <p className={`text-4xl font-black ${response.prediction === 'AI_GENERATED' ? 'text-orange-500' : 'text-cyan-400'}`}>
                        {(response.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 rounded-full ${response.prediction === 'AI_GENERATED' ? 'bg-gradient-to-r from-orange-600 to-red-500' : 'bg-gradient-to-r from-cyan-600 to-emerald-500'}`}
                        style={{ width: `${response.confidence * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className={`text-[10px] font-black ${response.prediction === 'AI_GENERATED' ? 'text-orange-500' : 'text-slate-600'}`}>SYNTHETIC MARKERS</span>
                        <span className={`text-[10px] font-black ${response.prediction === 'HUMAN' ? 'text-cyan-400' : 'text-slate-600'}`}>NATURAL LINGUISTICS</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 group relative">
                    <div className={`absolute -left-1 top-4 bottom-4 w-1 rounded-full ${response.prediction === 'AI_GENERATED' ? 'bg-orange-500' : 'bg-cyan-500'}`}></div>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Reasoning</p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {response.details?.reasoning}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Audit Authenticity</p>
                    {feedbackStatus === 'idle' && (
                      <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => setFeedbackStatus('confirmed')} className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-600/20 py-4 rounded-xl transition-all border border-emerald-500/30 group">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Correct Output</span>
                        </button>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button onClick={() => handleManualFeedback('HUMAN')} className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700 py-3 rounded-xl transition-all border border-slate-700">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Mark as Human</span>
                            </button>
                            <button onClick={() => handleManualFeedback('AI_GENERATED')} className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-700 py-3 rounded-xl transition-all border border-slate-700">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Mark as AI</span>
                            </button>
                        </div>
                      </div>
                    )}

                    {feedbackStatus === 'confirmed' && (
                      <div className="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20 text-emerald-400 text-center space-y-3">
                          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-xs font-black uppercase tracking-widest">Verified Successful</p>
                          <button onClick={() => setResponse(null)} className="text-[10px] text-slate-400 hover:text-white underline underline-offset-4">Reset Session</button>
                      </div>
                    )}

                    {feedbackStatus === 'learning' && (
                      <div className="bg-orange-500/10 p-8 rounded-xl border border-orange-500/20 flex flex-col items-center text-center gap-4">
                          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <div>
                              <p className="text-orange-400 text-xs font-black uppercase tracking-widest">Re-Calibrating Model...</p>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                 <div className="w-16 h-16 border border-slate-800 rounded-full flex items-center justify-center bg-slate-900/40">
                    <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Awaiting Capture</p>
              </div>
            )}
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

export default Sandbox;
