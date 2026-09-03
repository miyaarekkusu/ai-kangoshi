import React, { useState } from 'react';
import { 
  Stethoscope, 
  User, 
  Volume2, 
  Send, 
  Sparkles
} from 'lucide-react';
import { AvatarNurse } from '../AvatarNurse';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { speechEngine } from '../../services/speechEngine';
import { AIIntakeEngine } from '../../services/aiIntakeEngine';

export const ConsultationInterpreterScreen = ({ 
  patientRecord, 
  selectedLang = 'pt' 
}) => {
  const langObj = SUPPORTED_LANGUAGES.find(l => l.id === selectedLang) || SUPPORTED_LANGUAGES[0];

  const [consultationDialogue, setConsultationDialogue] = useState([
    {
      speaker: 'doctor',
      text: 'こんにちは、Carlosさん。問診票を確認しました。お腹の痛む位置と強さを教えていただけますか？',
      translation: 'Olá, Carlos. Verifiquei sua ficha. Pode me mostrar onde doi na sua barriga e a intensidade?'
    },
    {
      speaker: 'patient',
      text: 'Aqui na parte inferior direita, doutor. Dói muito quando tento andar.',
      translation: '先生、こちらの右下のお腹です。歩こうとするとすごく痛みます。'
    }
  ]);

  const [doctorInput, setDoctorInput] = useState('');
  const [patientInput, setPatientInput] = useState('');
  const [avatarState, setAvatarState] = useState('idle');

  const handleDoctorSpeak = (text = doctorInput) => {
    if (!text.trim()) return;
    const translated = AIIntakeEngine.translateDoctorPatient(text, 'ja', selectedLang);

    setConsultationDialogue(prev => [
      ...prev,
      { speaker: 'doctor', text, translation: translated }
    ]);
    setDoctorInput('');
    setAvatarState('speaking');
    speechEngine.speak(translated, langObj.code, () => setAvatarState('speaking'), () => setAvatarState('idle'));
  };

  const handlePatientSpeak = (text = patientInput) => {
    if (!text.trim()) return;
    const translated = AIIntakeEngine.translateDoctorPatient(text, selectedLang, 'ja');

    setConsultationDialogue(prev => [
      ...prev,
      { speaker: 'patient', text, translation: translated }
    ]);
    setPatientInput('');
    setAvatarState('speaking');
    speechEngine.speak(translated, 'ja-JP', () => setAvatarState('speaking'), () => setAvatarState('idle'));
  };

  const doctorPhrases = [
    '息を大きく吸って、吐いてください。',
    '血液検査とレントゲン撮影を行います。',
    '今夜は安静にして、処方されたお薬を食後に飲んでください。',
    'アレルギーの症状はありませんか？'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">診察中</span>
              <h2 className="text-sm font-bold text-slate-900">
                患者: {patientRecord?.patientName || 'Carlos Silva'} 様 ({patientRecord?.lang || 'Portuguese'})
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
              問診要約: <span className="text-teal-800 font-bold">{patientRecord?.chiefComplaint || '頭痛および発熱 (8/10)'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-teal-800">
          <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
          <span>AI看護師通訳アクティブ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Doctor Side (JP) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              医師の発話 (日本語 🇯🇵)
            </span>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">定型会話:</span>
              <div className="flex flex-col gap-1">
                {doctorPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDoctorSpeak(phrase)}
                    className="text-left text-xs bg-slate-50 border border-slate-200 hover:border-teal-500 text-slate-800 p-2 rounded-xl"
                  >
                    "{phrase}"
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={doctorInput}
              onChange={(e) => setDoctorInput(e.target.value)}
              placeholder="医師の質問を入力..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-2.5 text-xs text-slate-900"
              rows={2}
            />
          </div>

          <button
            onClick={() => handleDoctorSpeak()}
            className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>患者言語 ({langObj.native}) へ通訳</span>
          </button>
        </div>

        {/* AI Interpreter Active Avatar */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <AvatarNurse
            state={avatarState}
            currentText={consultationDialogue[consultationDialogue.length - 1]?.translation}
            size="sm"
          />
          <span className="text-xs font-extrabold text-teal-800 mt-2 block">
            リアルタイム双方向通訳中
          </span>
          <p className="text-[10px] text-slate-500">
            医師 (日本語) ⇄ 患者 ({langObj.native})
          </p>
        </div>

        {/* Patient Side (Native) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-sky-600" />
              患者の発話 ({langObj.native} {langObj.flag})
            </span>

            <textarea
              value={patientInput}
              onChange={(e) => setPatientInput(e.target.value)}
              placeholder={`Em ${langObj.native}...`}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-2.5 text-xs text-slate-900"
              rows={4}
            />
          </div>

          <button
            onClick={() => handlePatientSpeak()}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>日本語へリアルタイム通訳</span>
          </button>
        </div>

      </div>

      {/* Bilingual Dialogue Stream */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          診察室 通訳ログ
        </h3>

        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
          {consultationDialogue.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border ${
                msg.speaker === 'doctor'
                  ? 'bg-slate-50 border-teal-200 text-slate-900'
                  : 'bg-sky-50 border-sky-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>{msg.speaker === 'doctor' ? '👨‍⚕️ 医師 (JP)' : `👤 患者 (${langObj.name})`}</span>
                <button
                  onClick={() => speechEngine.speak(msg.text, msg.speaker === 'doctor' ? 'ja-JP' : langObj.code)}
                  className="hover:text-teal-700"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-bold">{msg.text}</p>
              <p className="mt-1 pt-1 border-t border-slate-200 text-xs text-teal-800 font-medium">
                💬 通訳: {msg.translation}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
