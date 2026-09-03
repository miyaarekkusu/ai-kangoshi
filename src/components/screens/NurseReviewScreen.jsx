import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Edit3, 
  Send, 
  FileText, 
  Clock, 
  Pill, 
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AIIntakeEngine } from '../../services/aiIntakeEngine';
import { PRESET_PATIENT_SCENARIOS } from '../../data/mockData';

export const NurseReviewScreen = ({ 
  intakeData, 
  onConfirmAndRegisterEHR 
}) => {
  const activeScenario = intakeData?.presetId 
    ? PRESET_PATIENT_SCENARIOS.find(s => s.id === intakeData.presetId) 
    : PRESET_PATIENT_SCENARIOS[0];

  const analysis = intakeData?.dialogue 
    ? AIIntakeEngine.analyzeDialogue(intakeData.dialogue)
    : activeScenario.aiSummary;

  const [formData, setFormData] = useState({
    patientName: activeScenario.patientName,
    age: activeScenario.age,
    gender: activeScenario.gender,
    nationality: activeScenario.nationality,
    chiefComplaint: analysis.translatedForm.chiefComplaint,
    onset: analysis.translatedForm.onset,
    allergies: activeScenario.allergies,
    medications: activeScenario.medications,
    pastHistory: activeScenario.history,
    triageLevel: analysis.triageLevel,
    triageReason: analysis.triageReason,
    category: analysis.category,
    nurseNotes: 'AI下書き内容を確認済み。バイタルサイン正常、アレルギー歴を再確認。'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleApproveAndRegister = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setIsConfirmed(true);

    const fhirRecord = AIIntakeEngine.createFHIRRecord({
      triageLevel: formData.triageLevel,
      category: formData.category,
      translatedForm: formData
    });

    onConfirmAndRegisterEHR({
      formData,
      fhirRecord,
      timestamp: new Date().toLocaleString('ja-JP')
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">看護師ダブルチェック (Human-in-the-Loop)</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                看護師確認フェーズ
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              AIが自動生成した日本語問診票です。内容を確認のうえ確定ボタンを押してください。
            </p>
          </div>
        </div>

        <div className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2 ${
          formData.triageLevel === 'Red'
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : formData.triageLevel === 'Yellow'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold opacity-75">AI トリアージ</div>
            <div className="text-xs font-bold">緊急度: {formData.triageLevel}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Draft & Nurse Editing */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>日本語問診票ドラフト (AI自動生成)</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? '完了' : '修正'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">患者名</span>
              <span className="font-bold text-slate-900">{formData.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">年齢 / 性別</span>
              <span className="font-bold text-slate-800">{formData.age}歳 / {formData.gender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">国籍</span>
              <span className="font-bold text-teal-800">{formData.nationality}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">ID</span>
              <span className="font-mono font-bold text-slate-700">P-9021</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                主訴 (Chief Complaint)
              </label>
              {isEditing ? (
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  className="w-full bg-slate-50 border border-teal-500 rounded-xl p-3 text-xs text-slate-900"
                  rows={2}
                />
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 leading-relaxed">
                  {formData.chiefComplaint}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  発症時期・経過
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium">
                  {formData.onset}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-rose-700 block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  アレルギー情報 (Allergies)
                </label>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs font-bold text-rose-800 flex items-center justify-between">
                  <span>{formData.allergies}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">要注意</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-sky-600" />
                  現在服用中のお薬
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800">
                  {formData.medications}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  既往歴
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800">
                  {formData.pastHistory}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleApproveAndRegister}
              disabled={isConfirmed}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                isConfirmed
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white active:scale-98'
              }`}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>確定・電子カルテへ自動登録完了！</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>問診票を確定して模擬電子カルテ（EHR）へ自動登録</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Original Patient Dialogue Comparison */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              原発話（患者母国語）と対訳
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 text-xs no-scrollbar">
            {activeScenario.dialogueHistory.map((d, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block">
                  {d.speaker === 'patient' ? '👤 患者発話 (原文)' : '🤖 AI看護師'}
                </span>
                <p className="font-bold text-slate-900">{d.text}</p>
                <p className="text-[11px] text-teal-700 font-medium pt-1 border-t border-slate-200">
                  🇯🇵 {d.translation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
