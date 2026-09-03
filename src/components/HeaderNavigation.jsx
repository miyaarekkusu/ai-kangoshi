import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MessageSquareHeart, 
  ClipboardCheck, 
  PhoneCall, 
  Languages, 
  BarChart3, 
  Globe, 
  Clock,
  Menu,
  X
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/mockData';

export const HeaderNavigation = ({ 
  activeTab, 
  setActiveTab, 
  selectedLang, 
  setSelectedLang, 
  onTriggerEmergencyCall 
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === selectedLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { 
      id: 'intake', 
      num: '01', 
      titleJa: '問診対話', 
      subText: currentLangObj.navSubtitles.intake,
      icon: MessageSquareHeart 
    },
    { 
      id: 'review', 
      num: '02', 
      titleJa: '問診票確認', 
      subText: currentLangObj.navSubtitles.review,
      icon: ClipboardCheck 
    },
    { 
      id: 'dispatch', 
      num: '03', 
      titleJa: '通訳呼び出し', 
      subText: currentLangObj.navSubtitles.dispatch,
      icon: PhoneCall 
    },
    { 
      id: 'interpreter', 
      num: '04', 
      titleJa: '診察通訳', 
      subText: currentLangObj.navSubtitles.interpreter,
      icon: Languages 
    },
    { 
      id: 'analytics', 
      num: '05', 
      titleJa: '管理・ログ', 
      subText: currentLangObj.navSubtitles.analytics,
      icon: BarChart3 
    }
  ];

  return (
    <>
      {/* ===== MOBILE TOP BAR (iPhone Viewport) ===== */}
      <header className="lg:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5" onClick={() => setActiveTab('intake')}>
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight">
              NurseLink AI
            </h1>
            <p className="text-[10px] text-teal-400 font-medium">iPhone Mobile Mode</p>
          </div>
        </div>

        {/* Mobile Actions: Language Selector + Menu Drawer Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-800 text-xs font-bold text-teal-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                {lang.flag} {lang.native}
              </option>
            ))}
          </select>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-slate-950/90 backdrop-blur-lg p-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.id === 'dispatch') {
                    onTriggerEmergencyCall();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-bold shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950/50 text-teal-300">
                  {item.num}
                </span>
                <Icon className="w-4 h-4 text-teal-300" />
                <div className="text-left">
                  <span className="block text-sm font-bold">{item.titleJa}</span>
                  <span className="block text-xs text-slate-400">{item.subText}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== DESKTOP SIDEBAR (Large Screens) ===== */}
      <aside className="hidden lg:flex w-64 md:w-72 bg-[#091322] border-r border-slate-800/80 flex-col justify-between h-full p-5 select-none shrink-0 z-40">
        
        {/* Top Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/30">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-tight leading-tight">
                NurseLink AI
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Fluxo completo — protótipo
              </p>
            </div>
          </div>

          <nav className="space-y-2 pt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'dispatch') {
                      onTriggerEmergencyCall();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full text-left flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#15253e] text-white shadow-lg shadow-slate-950/50 border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1d33]/80'
                  }`}
                >
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg transition-colors ${
                    isActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'
                  }`}>
                    {item.num}
                  </span>

                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold truncate block ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {item.titleJa}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block font-medium">
                      {item.subText}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Language Selector */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                Idioma / Language
              </span>
              <span className="text-[10px] text-teal-400 uppercase font-mono">Select</span>
            </div>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full bg-slate-900 text-xs font-bold text-slate-100 border border-slate-700/80 rounded-xl p-2 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-100">
                  {lang.flag} {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{time}</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
