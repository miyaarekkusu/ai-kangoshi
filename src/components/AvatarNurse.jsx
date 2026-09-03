import React from 'react';
import { Volume2, Mic, Sparkles, HeartPulse, CheckCircle2 } from 'lucide-react';

/**
 * AvatarNurse Component
 * Expressive 2D animated AI Nurse character ("Aoi-san")
 * Props:
 *  - state: 'idle' | 'listening' | 'speaking' | 'thinking' | 'empathetic' | 'success'
 *  - currentText: string (subtitle / bubble speech)
 *  - size: 'sm' | 'md' | 'lg'
 */
export const AvatarNurse = ({ state = 'idle', currentText = '', size = 'md' }) => {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSuccess = state === 'success';

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-64 h-64'
  }[size] || 'w-44 h-44';

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Speech Bubble Above Avatar */}
      {currentText && (
        <div className="mb-4 max-w-md w-full animate-fade-in z-20">
          <div className="relative bg-slate-900/90 border border-teal-500/40 backdrop-blur-md text-slate-100 p-4 rounded-2xl shadow-xl shadow-teal-950/40 text-center">
            <div className="flex items-center justify-center gap-2 mb-1 text-teal-400 font-semibold text-xs uppercase tracking-wider">
              {isSpeaking ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse text-teal-400" />
                  <span>AI看護師 葵 (Aoi) が発話中...</span>
                </>
              ) : isListening ? (
                <>
                  <Mic className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
                  <span>患者様のお声を聴いています...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI看護師 葵 (Aoi)</span>
                </>
              )}
            </div>
            <p className="text-sm md:text-base font-medium leading-relaxed text-slate-100">
              "{currentText}"
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-teal-500/40 rotate-45"></div>
          </div>
        </div>
      )}

      {/* Avatar Container with glowing ring */}
      <div className="relative group">
        {/* Animated Glow Halo */}
        <div
          className={`absolute -inset-2 rounded-full blur-xl transition-all duration-500 ${
            isSpeaking
              ? 'bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 opacity-80 animate-pulse'
              : isListening
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 opacity-90 animate-ping'
              : isThinking
              ? 'bg-gradient-to-r from-amber-400 to-indigo-500 opacity-70 animate-spin'
              : 'bg-teal-500/30 opacity-50'
          }`}
        ></div>

        {/* Outer Avatar Frame */}
        <div className={`relative ${sizeClasses} rounded-full bg-gradient-to-b from-slate-900 via-teal-950/80 to-slate-900 border-2 border-teal-400/50 shadow-2xl overflow-hidden p-2 flex items-center justify-center transition-transform duration-300 transform hover:scale-105`}>
          
          {/* Audio Soundwaves floating inside circle when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none opacity-30">
              <div className="w-1 bg-teal-400 h-8 animate-pulse"></div>
              <div className="w-1 bg-cyan-400 h-14 animate-pulse delay-75"></div>
              <div className="w-1 bg-emerald-400 h-10 animate-pulse delay-150"></div>
              <div className="w-1 bg-cyan-400 h-16 animate-pulse delay-100"></div>
              <div className="w-1 bg-teal-400 h-8 animate-pulse"></div>
            </div>
          )}

          {/* SVG AI Nurse Character Vector Illustration */}
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="100%" stopColor="#fed7aa" />
              </linearGradient>
              <linearGradient id="uniformGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Nurse Uniform / Collar */}
            <path d="M 40 180 Q 100 145 160 180 L 175 200 L 25 200 Z" fill="url(#uniformGradient)" />
            {/* White V-Neck Collar */}
            <path d="M 75 160 L 100 185 L 125 160 Z" fill="#ffffff" opacity="0.9" />
            <path d="M 92 160 L 100 170 L 108 160 Z" fill="#0d9488" />
            {/* Stethoscope around neck */}
            <path d="M 50 160 Q 100 205 150 160" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="100" cy="188" r="6" fill="#14b8a6" stroke="#ffffff" strokeWidth="2" />

            {/* Neck */}
            <rect x="86" y="125" width="28" height="30" rx="6" fill="url(#skinGradient)" />

            {/* Back Hair */}
            <path d="M 45 75 Q 40 140 60 160 Q 140 160 155 140 Q 160 75 155 75 Z" fill="url(#hairGradient)" />

            {/* Head Face Oval */}
            <ellipse cx="100" cy="95" rx="42" ry="46" fill="url(#skinGradient)" />

            {/* Ears */}
            <circle cx="56" cy="98" r="8" fill="url(#skinGradient)" />
            <circle cx="144" cy="98" r="8" fill="url(#skinGradient)" />

            {/* Front Hair Bangs */}
            <path d="M 56 80 C 60 55 140 55 144 80 C 130 65 110 75 100 68 C 90 75 70 65 56 80 Z" fill="url(#hairGradient)" />

            {/* Nurse Cap */}
            <path d="M 64 54 Q 100 40 136 54 L 130 38 Q 100 32 70 38 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Red Cross on Cap */}
            <rect x="96" y="38" width="8" height="12" rx="1" fill="#ef4444" />
            <rect x="94" y="40" width="12" height="8" rx="1" fill="#ef4444" />

            {/* Eyes */}
            {isThinking ? (
              // Sparkle / Thinking eyes looking up
              <g>
                <circle cx="80" cy="92" r="6" fill="#0f172a" />
                <circle cx="120" cy="92" r="6" fill="#0f172a" />
                <circle cx="82" cy="90" r="2" fill="#ffffff" />
                <circle cx="122" cy="90" r="2" fill="#ffffff" />
              </g>
            ) : isSuccess ? (
              // Happy squint eyes ^ ^
              <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 74 94 Q 80 88 86 94" />
                <path d="M 114 94 Q 120 88 126 94" />
              </g>
            ) : (
              // Normal attentive eyes
              <g>
                <ellipse cx="80" cy="94" rx="7" ry="9" fill="#0f172a" />
                <ellipse cx="120" cy="94" rx="7" ry="9" fill="#0f172a" />
                {/* Iris Highlights */}
                <circle cx="82" cy="91" r="3" fill="#ffffff" />
                <circle cx="122" cy="91" r="3" fill="#ffffff" />
                <circle cx="78" cy="96" r="1.5" fill="#38bdf8" />
                <circle cx="118" cy="96" r="1.5" fill="#38bdf8" />
              </g>
            )}

            {/* Eyebrows */}
            <path d="M 72 82 Q 80 80 88 83" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 112 83 Q 120 80 128 82" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Cute Rosy Cheeks */}
            <ellipse cx="70" cy="104" rx="7" ry="4" fill="#f43f5e" opacity="0.35" />
            <ellipse cx="130" cy="104" rx="7" ry="4" fill="#f43f5e" opacity="0.35" />

            {/* Nose */}
            <path d="M 98 100 Q 100 104 102 100" stroke="#f97316" strokeWidth="1.5" opacity="0.5" fill="none" />

            {/* Mouth */}
            {isSpeaking ? (
              // Lip-sync animated speaking mouth
              <g>
                <ellipse cx="100" cy="115" rx="8" ry="6" fill="#be123c" />
                <path d="M 94 113 Q 100 110 106 113" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            ) : isListening ? (
              // Slight open attentive mouth 'o'
              <circle cx="100" cy="114" r="4" fill="#9f1239" />
            ) : (
              // Gentle friendly smile
              <path d="M 92 112 Q 100 120 108 112" stroke="#9f1239" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </svg>

          {/* Status Overlay Badge */}
          <div className="absolute bottom-1 bg-slate-900/90 border border-teal-500/50 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-md">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-teal-400 animate-ping' : isListening ? 'bg-emerald-400 animate-bounce' : 'bg-slate-400'}`}></span>
            <span className="text-[10px] font-bold tracking-wider text-teal-300 uppercase">
              {isSpeaking ? 'TTS Speaking' : isListening ? 'Listening STT' : 'Nurse Aoi Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
