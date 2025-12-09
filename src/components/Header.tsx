import React from 'react';
import { Trophy, Zap, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="relative bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white transform hover:scale-105 transition-transform duration-300">
            <Trophy className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              {t('appTitle')}
            </h1>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              {t('appSubtitle')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'Tiếng Việt' : 'English'}
            </button>
            <span className="hidden sm:inline px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-sm font-medium text-slate-500">v1.2</span>
        </div>
      </div>
    </header>
  );
};
