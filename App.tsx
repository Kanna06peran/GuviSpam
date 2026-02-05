
import React, { useState } from 'react';
import { AppTab } from './types.ts';
import Sandbox from './components/Sandbox.tsx';
import EndpointTester from './components/EndpointTester.tsx';
import Documentation from './components/Documentation.tsx';
import BackendImplementation from './components/BackendImplementation.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.OVERVIEW);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">VOICESHIELD <span className="text-cyan-400">AI</span></h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Detection Engine v1.2.5</p>
            </div>
          </div>

          <nav className="flex items-center bg-slate-900/50 p-1 rounded-full border border-slate-800">
            {[
              { id: AppTab.OVERVIEW, label: 'Overview' },
              { id: AppTab.SANDBOX, label: 'Sandbox' },
              { id: AppTab.TESTER, label: 'Endpoint Tester' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-cyan-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        {activeTab === AppTab.OVERVIEW && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">HCL-GUVI Final Evaluation Specs</span>
              </div>
              <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight tracking-tighter">
                AI Voice Detection <span className="text-cyan-400">Endpoint Protocol</span>.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
                The requirements for the final submission are optimized for the provided FastAPI implementation. Use the Endpoint Tester to verify compliance.
              </p>
              
              {/* Mandatory Specifications Card */}
              <div className="bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <svg className="w-24 h-24 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                </div>
                
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-2">
                  Evaluation Requirements Checklist
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Endpoint URL</p>
                    <code className="text-cyan-400 font-bold">/detect-voice</code>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Header Key</p>
                    <code className="text-cyan-400 font-bold">x-api-key</code>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Key Value</p>
                    <code className="text-cyan-400 font-bold">A9f3KpL0XzQm2026</code>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">JSON Request Fields</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex justify-between"><span>language</span> <span className="text-slate-100 italic">"en-US"</span></li>
                      <li className="flex justify-between"><span>audio_format</span> <span className="text-slate-100 italic">"mp3"</span></li>
                      <li className="flex justify-between"><span>audio_base64</span> <span className="text-slate-100 italic">"base64..."</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">JSON Response Fields</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex justify-between"><span>prediction</span> <span className="text-emerald-400">"NOT_FRAUD" / "AI_GENERATED"</span></li>
                      <li className="flex justify-between"><span>confidence</span> <span className="text-emerald-400">0.90</span></li>
                      <li className="flex justify-between"><span>message</span> <span className="text-emerald-400">"Analysis complete"</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 mb-12">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Environment Setup (Install Dependencies)
                 </h4>
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-cyan-400">
                    pip install fastapi uvicorn pydantic python-multipart
                 </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setActiveTab(AppTab.SANDBOX)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 group shadow-xl shadow-cyan-600/20"
                >
                  USE DETECTION SANDBOX
                </button>
                <button 
                  onClick={() => setActiveTab(AppTab.TESTER)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-xl font-black transition-all border border-slate-700"
                >
                  TEST YOUR DEPLOYED API
                </button>
              </div>
            </div>

            <div className="mt-20">
               <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8 border-l-4 border-cyan-500 pl-4">Implementation Guides</h3>
               <BackendImplementation />
            </div>
          </div>
        )}

        {activeTab === AppTab.SANDBOX && <Sandbox />}
        {activeTab === AppTab.TESTER && <EndpointTester />}
      </main>

      <footer className="border-t border-slate-900 py-8 px-6 text-center">
        <p className="text-slate-600 text-xs">
          &copy; 2024 VoiceShield AI. Prepared for GUVI–HCL AI Evaluation System.
        </p>
      </footer>
    </div>
  );
};

export default App;
