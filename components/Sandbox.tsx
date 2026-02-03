
import React, { useState, useRef, useEffect } from 'react';
import { detectVoice } from '../services/geminiService';
import { DetectionRequest, DetectionResponse, AudioFormat } from '../types';

const Sandbox: React.FC = () => {
  const [apiKey, setApiKey] = useState('test_key_abc_123');
  const [language, setLanguage] = useState('en-US');
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<DetectionResponse | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = async () => {
    try {
      setFileError(null);
      setResponse(null);
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
        processAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setFileError("Microphone access denied. Please check your browser permissions.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processAudioBlob = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const payload: DetectionRequest = {
          language,
          audio_format: 'wav', // We use 'wav' as a generic label, service handles base64 content
          audio_base64: base64String
        };
        const result = await detectVoice(payload);
        setResponse(result);
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setFileError("Error processing audio stream.");
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setResponse(null);

    if (file.size > 10 * 1024 * 1024) {
      setFileError("File too large. Max 10MB allowed.");
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const payload: DetectionRequest = {
          language,
          audio_format: audioFormat,
          audio_base64: base64String
        };
        const result = await detectVoice(payload);
        setResponse(result);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFileError("Failed to read the uploaded file.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div className="space-y-6">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Simulation API Key</label>
              <input 
                type="text" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-slate-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Target Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-slate-300"
                >
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="te-IN">Telugu (Regional)</option>
                  <option value="ml-IN">Malayalam (Regional)</option>
                  <option value="ta-IN">Tamil</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Upload Format</label>
                <select 
                  value={audioFormat} 
                  onChange={(e) => setAudioFormat(e.target.value as AudioFormat)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-slate-300"
                >
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Capture Audio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 ${
                isRecording 
                ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                : 'border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 cursor-pointer group'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                {isRecording ? (
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-wider">{isRecording ? 'Stop Session' : 'Record Live'}</p>
                {isRecording ? (
                   <p className="text-xs text-red-400 font-mono mt-1 font-bold">{Math.floor(recordingDuration / 60)}:{ (recordingDuration % 60).toString().padStart(2, '0') }</p>
                ) : (
                  <p className="text-[10px] text-slate-500 uppercase mt-1 font-bold">In-Browser Capture</p>
                )}
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-all">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-wider">Upload Local</p>
                <p className="text-[10px] text-slate-500 uppercase mt-1 font-bold">MP3, WAV, WebM</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".mp3,.wav,.webm,.ogg"
                className="hidden"
              />
            </div>
          </div>

          {fileError && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{fileError}</span>
            </div>
          )}

          {isProcessing && (
            <div className="mt-6 flex flex-col items-center p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-cyan-400 animate-pulse font-black text-xs uppercase tracking-widest">Neural Analysis Active</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/80 rounded-3xl p-8 border border-slate-800 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800 relative z-10">
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tighter">Diagnostic Report</h3>
            {response && (
              <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest border ${
                response.status === 'success' 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {response.status.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-grow relative z-10">
            {!response && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700">
                <div className="w-20 h-20 mb-6 bg-slate-800/30 rounded-3xl flex items-center justify-center">
                    <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Awaiting Signal Input</p>
              </div>
            )}

            {response && (
              <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Classification</p>
                    <p className={`text-2xl font-black ${response.prediction === 'AI_GENERATED' ? 'text-orange-500' : 'text-cyan-400'}`}>
                      {response.prediction.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Confidence</p>
                    <p className="text-2xl font-black text-white">
                      {(response.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linguistic Reasoning</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
                    "{response.details?.reasoning}"
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between px-1 mb-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detected Locale: <span className="text-cyan-500">{response.details?.detected_language}</span></p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-[10px] overflow-auto max-h-[180px] custom-scrollbar shadow-inner">
                    <pre className="text-green-500/80 leading-relaxed">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
