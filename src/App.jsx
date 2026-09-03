import React, { useState } from 'react';
import { HeaderNavigation } from './components/HeaderNavigation';
import { PatientIntakeScreen } from './components/screens/PatientIntakeScreen';
import { NurseReviewScreen } from './components/screens/NurseReviewScreen';
import { EHRRegisterScreen } from './components/screens/EHRRegisterScreen';
import { ConsultationInterpreterScreen } from './components/screens/ConsultationInterpreterScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { INITIAL_EHR_RECORDS, SUPPORTED_LANGUAGES } from './data/mockData';
import { PhoneCall, X, Sparkles } from 'lucide-react';
import { speechEngine } from './services/speechEngine';

export function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [selectedLang, setSelectedLang] = useState('pt');
  const [intakeData, setIntakeData] = useState(null);
  const [ehrRecords, setEhrRecords] = useState(INITIAL_EHR_RECORDS);
  const [selectedEhrForConsultation, setSelectedEhrForConsultation] = useState(INITIAL_EHR_RECORDS[0]);
  
  // Emergency / Quick Dispatch Call Overlay State
  const [showEmergencyCallModal, setShowEmergencyCallModal] = useState(false);

  // Workflow Handlers
  const handleIntakeCompleted = (data) => {
    setIntakeData(data);
    setActiveTab('review');
  };

  const handleConfirmAndRegisterEHR = ({ formData, fhirRecord, timestamp }) => {
    const newEhrEntry = {
      id: fhirRecord.id,
      timestamp,
      patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: formData.patientName,
      patientNameKana: formData.patientName,
      lang: SUPPORTED_LANGUAGES.find(l => l.id === selectedLang)?.name || selectedLang,
      triage: formData.triageLevel,
      status: 'Confirmed',
      department: formData.category,
      chiefComplaint: formData.chiefComplaint,
      vitals: formData.vitalSignsProposed || { bp: '130/82', hr: 96, temp: '38.5°C', spo2: '98%' },
      fhirData: fhirRecord
    };

    setEhrRecords(prev => [newEhrEntry, ...prev]);
    setSelectedEhrForConsultation(newEhrEntry);
    
    setTimeout(() => {
      setActiveTab('ehr');
    }, 1200);
  };

  const handleLaunchDoctorConsultation = (record) => {
    setSelectedEhrForConsultation(record || ehrRecords[0]);
    setActiveTab('interpreter');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Header / Navigation (Mobile Top Bar + Desktop Left Sidebar) */}
      <HeaderNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        onTriggerEmergencyCall={() => setShowEmergencyCallModal(true)}
      />

      {/* Main Content Area (Light Theme with High Contrast) */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 p-3 sm:p-6 md:p-8 animate-fade-in no-scrollbar">
        {activeTab === 'intake' && (
          <PatientIntakeScreen
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}
            onIntakeCompleted={handleIntakeCompleted}
          />
        )}

        {activeTab === 'review' && (
          <NurseReviewScreen
            intakeData={intakeData}
            onConfirmAndRegisterEHR={handleConfirmAndRegisterEHR}
          />
        )}

        {activeTab === 'ehr' && (
          <EHRRegisterScreen
            ehrRecords={ehrRecords}
            onLaunchDoctorConsultation={handleLaunchDoctorConsultation}
          />
        )}

        {activeTab === 'interpreter' && (
          <ConsultationInterpreterScreen
            patientRecord={selectedEhrForConsultation}
            selectedLang={selectedLang}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsScreen />
        )}
      </main>

      {/* Emergency / Quick Dispatch Call Modal */}
      {showEmergencyCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>通訳呼び出し (Chamar Intérprete)</span>
              </div>
              <button 
                onClick={() => setShowEmergencyCallModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              看護師が直接外国人患者様と対面会話を行う場面です。AI看護師通訳キャラクターをワンタップで現場通訳として呼び出します。
            </p>

            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">対応言語を選択:</span>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-bold text-teal-700 p-2.5 rounded-xl"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.flag} {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setShowEmergencyCallModal(false);
                setActiveTab('interpreter');
                speechEngine.speak('AI看護師通訳が起動しました。お話しください。', 'ja-JP');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>通訳画面（04）を起動する</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
export default App;
