import { Trophy, Zap, Globe, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white transform hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 truncate">
                {t('appTitle')}
              </h1>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{t('appSubtitle')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'VI' : 'EN'}</span>
            </button>

            {user && (
              <div className="flex items-center gap-1 max-w-[200px] sm:max-w-none">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-slate-100 rounded-full min-w-0 max-w-full">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 truncate min-w-0">
                    {user.role === 'guest' ? 'Guest' : (user.email?.split('@')[0] || 'Admin')}
                  </span>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role === 'admin' ? 'A' : 'G'}
                  </span>
                </div>
                
                <button
                  onClick={signOut}
                  className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
