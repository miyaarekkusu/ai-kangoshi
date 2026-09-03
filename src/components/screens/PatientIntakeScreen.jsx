import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Play,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { AvatarNurse } from '../AvatarNurse';
import { SUPPORTED_LANGUAGES, PRESET_PATIENT_SCENARIOS } from '../../data/mockData';
import { speechEngine } from '../../services/speechEngine';

export const PatientIntakeScreen = ({ 
  selectedLang, 
  setSelectedLang, 
  onIntakeCompleted 
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === selectedLang) || SUPPORTED_LANGUAGES[0];

  const [dialogue, setDialogue] = useState([
    {
      speaker: 'nurse',
      text: currentLangObj.welcome,
      translation: currentLangObj.welcomeJa
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [avatarState, setAvatarState] = useState('idle');
  const [painLevel, setPainLevel] = useState(6);
  const [selectedPresetId, setSelectedPresetId] = useState('pt-stomach');

  useEffect(() => {
    setDialogue([
      {
        speaker: 'nurse',
        text: currentLangObj.welcome,
        translation: currentLangObj.welcomeJa
      }
    ]);
    setAvatarState('speaking');
    speechEngine.speak(currentLangObj.welcome, currentLangObj.code, () => setAvatarState('speaking'), () => setAvatarState('idle'));
  }, [selectedLang]);

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    let translationSim = `[日本語訳]: ${textToSend}`;
    if (textToSend.includes('headache') || textToSend.includes('cabeça') || textToSend.includes('cabeza') || textToSend.includes('头痛')) {
      translationSim = '激しい頭痛がします。';
    } else if (textToSend.includes('dizzy') || textToSend.includes('tontura') || textToSend.includes('mareo') || textToSend.includes('头晕')) {
      translationSim = '立ち上がるとめまいがします。';
    } else if (textToSend.includes('nausea') || textToSend.includes('enjoo') || textToSend.includes('náuseas') || textToSend.includes('恶心')) {
      translationSim = '吐き気がして気分が悪いです。';
    }

    const newDialogue = [
      ...dialogue,
      { speaker: 'patient', text: textToSend, translation: translationSim }
    ];

    setDialogue(newDialogue);
    setInputText('');
    setAvatarState('thinking');

    setTimeout(() => {
      let nurseReply = '';
      let nurseTranslation = '';

      if (selectedLang === 'pt') {
        nurseReply = 'Compreendi perfeitamente. Vou registrar esses sintomas para a enfermeira.';
        nurseTranslation = '了解いたしました。症状を看護師問診票に記録します。';
      } else if (selectedLang === 'en') {
        nurseReply = 'Understood clearly. I will record these symptoms into the nurse intake form.';
        nurseTranslation = '了解いたしました。症状を看護師問診票に記録します。';
      } else if (selectedLang === 'es') {
        nurseReply = 'Entendido. Registraré estos síntomas para la enfermera.';
        nurseTranslation = '了解いたしました。症状を看護師問診票に記録します。';
      } else if (selectedLang === 'zh') {
        nurseReply = '好的，明白了。我会将这些症状记录到护士问诊单中。';
        nurseTranslation = '了解いたしました。症状を看護師問診票に記録します。';
      } else {
        nurseReply = '了解いたしました。これらの症状を看護師問診票に記録いたします。';
        nurseTranslation = '';
      }

      setDialogue(prev => [
        ...prev,
        { speaker: 'nurse', text: nurseReply, translation: nurseTranslation }
      ]);

      setAvatarState('speaking');
      speechEngine.speak(nurseReply, currentLangObj.code, () => setAvatarState('speaking'), () => setAvatarState('idle'));
    }, 1000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
      setAvatarState('idle');
    } else {
      setIsRecording(true);
      setAvatarState('listening');
      const success = speechEngine.startListening(
        currentLangObj.code,
        (res) => {
          setInputText(res.transcript);
          if (res.isFinal) {
            setIsRecording(false);
            setAvatarState('idle');
          }
        },
        (state) => {
          if (!state.isListening) setIsRecording(false);
        }
      );

      if (!success) {
        setTimeout(() => {
          const sample = currentLangObj.chips[0].text;
          setInputText(sample);
          setIsRecording(false);
          setAvatarState('idle');
        }, 1800);
      }
    }
  };

  const handleLoadPresetScenario = (scenario) => {
    setSelectedLang(scenario.lang);
    setDialogue(scenario.dialogueHistory);
    setSelectedPresetId(scenario.id);
    setAvatarState('speaking');
    speechEngine.speak(
      scenario.dialogueHistory[scenario.dialogueHistory.length - 1].text, 
      SUPPORTED_LANGUAGES.find(l => l.id === scenario.lang)?.code || 'ja-JP',
      () => setAvatarState('speaking'),
      () => setAvatarState('idle')
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 font-sans">
      
      {/* Top Mobile Header Title */}
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold shadow-sm">
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          <span>{currentLangObj.badge}</span>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {currentLangObj.title}
        </h1>
        
        <p className="text-xs text-slate-600 leading-relaxed">
          {currentLangObj.subtitle}
        </p>
      </div>

      {/* Preset Scenario Quick Selectors */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Play className="w-3 h-3 text-teal-600" />
          Presets:
        </span>
        {PRESET_PATIENT_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleLoadPresetScenario(sc)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              selectedPresetId === sc.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {sc.lang === 'pt' ? '🇧🇷 PT' : sc.lang === 'en' ? '🇺🇸 EN' : sc.lang === 'es' ? '🇪🇸 ES' : '🇨🇳 ZH'}
          </button>
        ))}
      </div>

      {/* iPhone Display Frame Mockup (Clean High Contrast Light Theme) */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
        
        {/* Sleek iPhone Border Shell */}
        <div className="bg-white border-[6px] border-slate-900 rounded-[42px] shadow-2xl p-4 sm:p-5 relative overflow-hidden">
          
          {/* Dynamic Island / Notch */}
          <div className="flex justify-center mb-3">
            <div className="w-24 h-4 rounded-full bg-slate-900 flex items-center justify-end px-2">
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
            </div>
          </div>

          {/* iPhone App Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-amber-500 font-bold text-xs">
                  😊
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  {currentLangObj.nurseName}
                </h3>
                <p className="text-[10px] text-teal-700 font-bold">
                  {currentLangObj.native}
                </p>
              </div>
            </div>
            
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-extrabold uppercase">
              {currentLangObj.id}
            </span>
          </div>

          {/* Interactive AI Nurse Avatar */}
          <div className="my-1 flex justify-center scale-90">
            <AvatarNurse
              state={avatarState}
              currentText={dialogue[dialogue.length - 1]?.text}
              size="sm"
            />
          </div>

          {/* Speech Dialogue Stream (High Contrast Light Mode) */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar my-3">
            {dialogue.map((msg, index) => {
              const isNurse = msg.speaker === 'nurse';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isNurse ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 shadow-sm ${
                      isNurse
                        ? 'bg-rose-50 text-slate-900 border border-rose-200 rounded-bl-none'
                        : 'bg-sky-600 text-white rounded-br-none'
                    }`}
                  >
                    <p className="text-xs font-bold leading-relaxed">
                      {msg.text}
                    </p>
                    
                    {/* Japanese Nurse Subtitle */}
                    {msg.translation && (
                      <p className={`text-[10px] mt-1 pt-1 border-t font-sans ${
                        isNurse ? 'text-slate-600 border-rose-200/80' : 'text-sky-100 border-sky-500/80'
                      }`}>
                        {msg.translation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Touch Symptom Chips */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {currentLangObj.chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip.text)}
                  className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 text-[11px] font-bold transition-all active:scale-95 shadow-sm"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Mic Recording & Send Input Bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-teal-600 text-white font-bold hover:bg-teal-500'
                }`}
                title="Voice Mic Input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={currentLangObj.inputPlaceholder}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />

              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Complete Intake Action Button */}
        <button
          onClick={() => onIntakeCompleted({ lang: selectedLang, dialogue, painLevel })}
          className="w-full mt-4 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Concluir triagem e gerar ficha (問診完了・問診票作成)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
