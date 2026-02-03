
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
  
  // Recording states
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

  const startRecording = async () => {
    try {
      setFileError(null);
      setResponse(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudioBlob(audioBlob);
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setFileError("Microphone access denied or not available.");
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
          // Since we're recording raw, we categorize as 'wav' for the API consistency
          audio_format: 'wav', 
          audio_base64: base64String
        };

        const result = await detectVoice(payload);
        setResponse(result);
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setFileError("Failed to process recorded audio.");
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setResponse(null);

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File too large. Max 5MB allowed in simulation.");
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
      setFileError("Failed to read audio file.");
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div className="space-y-6">
        {/* Request Config Card */}
        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Request Headers & Params
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">x-api-key</label>
              <input 
                type="text" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="te-IN">Telugu</option>
                  <option value="ml-IN">Malayalam</option>
                  <option value="ta-IN">Tamil</option>
                  <option value="es-ES">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Format</label>
                <select 
                  value={audioFormat} 
                  onChange={(e) => setAudioFormat(e.target.value as AudioFormat)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Input Methods Card */}
        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Detection Input
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Record Option */}
            <div 
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                isRecording 
                ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 cursor-pointer'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
                {isRecording ? (
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{isRecording ? 'Recording...' : 'Live Record'}</p>
                {isRecording && <p className="text-xs text-red-400 font-mono mt-1">{formatTime(recordingDuration)}</p>}
                {!isRecording && <p className="text-[10px] text-slate-500 uppercase mt-1">Use Mic</p>}
              </div>
            </div>

            {/* File Upload Option */}
            <div 
              className="p-4 rounded-xl border-2 border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">Upload File</p>
                <p className="text-[10px] text-slate-500 uppercase mt-1">MP3, WAV</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".mp3,.wav"
                className="hidden"
              />
            </div>
          </div>

          {fileError && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fileError}
            </div>
          )}

          {isProcessing && (
            <div className="mt-6 flex flex-col items-center p-4 bg-slate-900/40 rounded-xl border border-slate-800">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="mt-3 text-cyan-400 animate-pulse font-medium text-sm">Analyzing acoustic properties...</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Results Panel */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 min-h-[400px] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-300">Analysis Results</h3>
            {response && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest ${response.status === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                {response.status.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-grow">
            {!response && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm font-medium">Capture or upload audio to begin</p>
              </div>
            )}

            {response && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Classification</p>
                    <p className={`text-xl font-black ${response.prediction === 'AI_GENERATED' ? 'text-orange-400' : 'text-cyan-400'}`}>
                      {response.prediction.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Confidence Score</p>
                    <p className="text-xl font-black text-white">
                      {(response.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linguistic Analysis</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 italic">
                    "{response.details?.reasoning}"
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Detected Locale: <span className="text-slate-300">{response.details?.detected_language}</span></p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] overflow-auto max-h-[150px] custom-scrollbar">
                    <pre className="text-green-400 leading-tight">
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
