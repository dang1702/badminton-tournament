import { Trophy, Zap, Globe, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'Tiếng Việt' : 'English'}
            </button>
            <span className="hidden sm:inline px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-sm font-medium text-slate-500">v1.2</span>

            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {user.role === 'guest' ? 'Guest' : user.email}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={signOut}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
