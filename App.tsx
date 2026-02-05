
import React, { useState } from 'react';
import { AppTab } from './types.ts';
import Sandbox from './components/Sandbox.tsx';

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
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Detection Engine v1.1.0</p>
            </div>
          </div>

          <nav className="flex items-center bg-slate-900/50 p-1 rounded-full border border-slate-800">
            {[
              { id: AppTab.OVERVIEW, label: 'Overview' },
              { id: AppTab.SANDBOX, label: 'Sandbox' }
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
            <div className="max-w-3xl mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                Detect Synthetic Voices with <span className="text-cyan-400">Neural Precision</span>.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                VoiceShield provides state-of-the-art AI detection for audio content. 
                Our engine features specialized linguistic training for multi-dialectal analysis, 
                distinguishing subtle forensic markers in both global and regional speech.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setActiveTab(AppTab.SANDBOX)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 group shadow-xl shadow-cyan-600/20"
                >
                  START DETECTION SANDBOX
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                <div className="w-12 h-12 bg-cyan-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Low Latency</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Average response time of &lt;150ms for typical audio clips via high-performance neural clusters.</p>
              </div>

              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Multilingual</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Support for 40+ global languages including specialized regional training for high-accuracy local detection.</p>
              </div>

              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">High Confidence</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Detailed confidence scoring with deep forensic reasoning provided for every classification.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === AppTab.SANDBOX && <Sandbox />}
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
