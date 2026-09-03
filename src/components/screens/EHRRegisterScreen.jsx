import React, { useState } from 'react';
import { 
  Database, 
  Code, 
  ArrowRight, 
  Languages, 
  CheckCircle2, 
  FileCode
} from 'lucide-react';
import { INITIAL_EHR_RECORDS } from '../../data/mockData';

export const EHRRegisterScreen = ({ 
  ehrRecords = INITIAL_EHR_RECORDS, 
  onLaunchDoctorConsultation 
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState(ehrRecords[0]?.id || 'EHR-2026-0891');
  const [showFhirJson, setShowFhirJson] = useState(false);

  const activeRecord = ehrRecords.find(r => r.id === selectedRecordId) || ehrRecords[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">模擬電子カルテシステム (Mock EHR)</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-300">
                HL7 FHIR 規格準拠
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              看護師によって確定された問診データが即座に同期・登録されます。
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFhirJson(!showFhirJson)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all"
        >
          <Code className="w-4 h-4" />
          <span>{showFhirJson ? 'カルテビューへ戻る' : 'FHIR JSON 構造表示'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Patient Queue */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            登録済み問診一覧 ({ehrRecords.length}件)
          </h3>

          <div className="space-y-2.5">
            {ehrRecords.map((record) => {
              const isSelected = record.id === selectedRecordId;
              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecordId(record.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{record.patientName}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      record.triage === 'Red' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {record.triage}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-1 mb-1">
                    主訴: {record.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                    <span>ID: {record.patientId}</span>
                    <span>{record.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Record Details OR FHIR JSON Viewer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          
          {showFhirJson ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-teal-700 font-mono flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  HL7 FHIR Standard JSON Payload
                </span>
              </div>
              <pre className="bg-slate-900 p-4 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[380px]">
                {JSON.stringify(activeRecord.fhirData || activeRecord, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-5">
              
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{activeRecord.patientName} 様</h3>
                  <p className="text-xs text-slate-600">
                    科別: <span className="text-teal-700 font-bold">{activeRecord.department}</span>
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>カルテ自動登録完了</span>
                </div>
              </div>

              {/* Vitals */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <span className="text-xs font-bold text-slate-700 block mb-2">バイタルサイン自動記録</span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">血圧</span>
                    <span className="font-extrabold text-teal-700">{activeRecord.vitals?.bp}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">脈拍</span>
                    <span className="font-extrabold text-teal-700">{activeRecord.vitals?.hr} bpm</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">体温</span>
                    <span className="font-extrabold text-amber-700">{activeRecord.vitals?.temp}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block">SpO2</span>
                    <span className="font-extrabold text-emerald-700">{activeRecord.vitals?.spo2}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-slate-700 block">主訴・症状経過</span>
                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                  {activeRecord.chiefComplaint}
                </p>
              </div>

            </div>
          )}

          {/* Launch Consultation Interpreter */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onLaunchDoctorConsultation(activeRecord)}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Languages className="w-4 h-4 text-white" />
              <span>この患者の問診を引き継ぎ診察室リアルタイム通訳（04）を起動</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
