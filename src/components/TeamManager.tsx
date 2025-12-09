import React, { useState } from 'react';
import { Plus, Users, Trash2, Shield } from 'lucide-react';
import type { Team } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (name: string) => void;
  onRemoveTeam?: (id: number) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ teams, onAddTeam, onRemoveTeam }) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAddTeam(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white/20 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-6 relative">
        <div className="p-2 bg-emerald-100/50 rounded-lg">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{t('teamRegistration')}</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
          {teams.length} {t('teams')}
        </span>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('enterTeamName')}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-700"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t('add')}</span>
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">{t('noTeams')}</p>
            <p className="text-sm text-slate-400">{t('addTeamsHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="group flex items-center justify-between p-3 bg-white border border-slate-100 hover:border-emerald-500/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100 rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {team.name}
                  </span>
                </div>
                {onRemoveTeam && (
                  <button
                    onClick={() => onRemoveTeam(team.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
