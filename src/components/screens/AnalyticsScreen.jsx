import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Globe, 
  Download, 
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import { MOCK_STATISTICS } from '../../data/mockData';

export const AnalyticsScreen = () => {
  const stats = MOCK_STATISTICS;

  return (
    <div className="max-w-6xl mx-auto space-y-5 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">看護業務負荷削減・多言語統計ダッシュボード</h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            NurseLink AI の導入による問診・通訳の削減時間、言語別実績、医療安全成果を可視化します。
          </p>
        </div>

        <button 
          onClick={() => alert('CSVログデータのダウンロードを開始しました。')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>監査ログCSVダウンロード</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">本日の完了問診</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalIntakesToday} <span className="text-xs font-normal text-slate-500">件</span></div>
          <p className="text-[10px] text-emerald-600 font-bold">前日比 +14% 増加</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">1人あたり削減時間</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{stats.timeSavedMinutesPerPatient} <span className="text-xs font-normal text-slate-500">分/人</span></div>
          <p className="text-[10px] text-slate-500 font-medium">通訳・入力作業を削減</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">今月の累積削減時間</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700">{stats.totalHoursSavedMonth} <span className="text-xs font-normal text-slate-500">時間</span></div>
          <p className="text-[10px] text-teal-600 font-bold">年間約 1,700 時間相当</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">AI問診承認率</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">87.5%</div>
          <p className="text-[10px] text-slate-500 font-medium">看護師による修正率わずか 12.5%</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-600" />
              言語別 利用実績内訳
            </h3>
            <span className="text-[10px] text-slate-500">直近30日間</span>
          </div>

          <div className="space-y-2.5">
            {stats.languageBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.flag} {item.lang}</span>
                  <span className="text-teal-700">{item.count} 件 ({item.percent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              トリアージ分類・安全実績
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold">医療事故ゼロ達成</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl">
              <span className="text-[9px] font-extrabold text-rose-800 uppercase block">Red (最優先)</span>
              <span className="text-xl font-extrabold text-rose-700">{stats.triageBreakdown.red} 件</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
              <span className="text-[9px] font-extrabold text-amber-900 uppercase block">Yellow (緊急)</span>
              <span className="text-xl font-extrabold text-amber-800">{stats.triageBreakdown.yellow} 件</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
              <span className="text-[9px] font-extrabold text-emerald-900 uppercase block">Green (一般)</span>
              <span className="text-xl font-extrabold text-emerald-800">{stats.triageBreakdown.green} 件</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">アレルギー事前検知</span>
                <span className="text-[10px] text-slate-600">ペニシリン・アスピリンアレルギーの自動検出</span>
              </div>
            </div>
            <span className="text-base font-extrabold text-amber-800">{stats.riskPreventionCount} 件</span>
          </div>
        </div>

      </div>

    </div>
  );
};
