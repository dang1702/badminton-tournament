import React from 'react';
import { Calendar, Swords } from 'lucide-react';
import type { GroupMatch } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface MatchListProps {
  matches: GroupMatch[];
  onUpdateScore?: (matchId: string, setIndex: 1 | 2 | 3, team: 'a' | 'b', score: number) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onUpdateScore }) => {
  const { t } = useLanguage();
  if (matches.length === 0) return null;

  const handleScoreChange = (matchId: string, setIndex: 1 | 2 | 3, team: 'a' | 'b', value: string) => {
    const score = parseInt(value) || 0;
    if (onUpdateScore) {
      onUpdateScore(matchId, setIndex, team, score);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-2.5 bg-purple-100 rounded-xl shadow-sm">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t('matchSchedule')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">{t('enterScores')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {matches.map((groupMatch, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-5 py-3 sm:py-4 text-white flex justify-between items-center">
              <span className="font-bold text-base sm:text-lg tracking-tight truncate">{groupMatch.group}</span>
              <Swords className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            </div>
            
            <div className="flex-1 divide-y divide-slate-100">
              {groupMatch.matchList.map((match, i) => (
                <div key={match.id || i} className="p-3 sm:p-4 hover:bg-slate-50 transition-all">
                  <div className="flex flex-col gap-3">
                    {/* Team Names Row */}
                    <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      <span className="w-[35%] sm:w-[40%] truncate" title={match.teamA.name}>{match.teamA.name}</span>
                      <span className="text-xs text-slate-400 font-normal">{t('vs')}</span>
                      <span className="w-[35%] sm:w-[40%] text-right truncate" title={match.teamB.name}>{match.teamB.name}</span>
                    </div>

                    {/* Score Inputs Row */}
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {/* Team A Inputs */}
                      <div className="flex gap-1">
                        {[1, 2, 3].map((set) => (
                          <input
                            key={`a-${set}`}
                            type="number"
                            min="0"
                            placeholder="0"
                            value={match.score?.[`set${set}` as keyof typeof match.score]?.a || ''}
                            onChange={(e) => handleScoreChange(match.id, set as 1|2|3, 'a', e.target.value)}
                            disabled={!onUpdateScore}
                            className={`w-8 h-7 sm:w-10 sm:h-8 text-center text-xs sm:text-sm font-bold border rounded ${
                              !onUpdateScore ? 'bg-slate-100 text-slate-500' : 'border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 sm:px-2">{t('sets')}</div>

                      {/* Team B Inputs */}
                      <div className="flex gap-1">
                        {[1, 2, 3].map((set) => (
                          <input
                            key={`b-${set}`}
                            type="number"
                            min="0"
                            placeholder="0"
                            value={match.score?.[`set${set}` as keyof typeof match.score]?.b || ''}
                            onChange={(e) => handleScoreChange(match.id, set as 1|2|3, 'b', e.target.value)}
                            disabled={!onUpdateScore}
                            className={`w-8 h-7 sm:w-10 sm:h-8 text-center text-xs sm:text-sm font-bold border rounded ${
                              !onUpdateScore ? 'bg-slate-100 text-slate-500' : 'border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
