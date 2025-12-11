import React, { useState } from 'react';
import { Plus, Users, Trash2, Shield, Edit3, Check, X } from 'lucide-react';
import type { Team } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (name: string) => void;
  onUpdateTeam: (id: number, newName: string) => void;
  onRemoveTeam: (id: number) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ teams, onAddTeam, onUpdateTeam, onRemoveTeam }) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAddTeam(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleStartEdit = (team: Team) => {
    setEditingId(team.id);
    setEditingName(team.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdateTeam(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white/20 p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 sm:mb-6 relative">
        <div className="p-2 bg-emerald-100/50 rounded-lg flex-shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate min-w-0 flex-1">{t('teamRegistration')}</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 flex-shrink-0">
          {teams.length} {t('teams')}
        </span>
      </div>

      <div className="flex gap-2 mb-4 sm:mb-6">
        <div className="relative flex-1 group min-w-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('enterTeamName')}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-700 text-sm sm:text-base"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{t('add')}</span>
        </button>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm sm:text-base">{t('noTeams')}</p>
            <p className="text-xs sm:text-sm text-slate-400">{t('addTeamsHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="group flex items-center justify-between p-2 sm:p-3 bg-white border border-slate-100 hover:border-emerald-500/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-0"
              >
                {editingId === team.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="flex-1 min-w-0 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      autoFocus
                    />
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={handleSaveEdit}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title={t('save')}
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors"
                        title={t('cancel')}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100 rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors text-sm sm:text-base truncate min-w-0" title={team.name}>
                        {team.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(team)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title={t('edit')}
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveTeam(team.id)}
                        className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove team"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
