import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import type { GroupMatch, Match } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface KnockoutBracketProps {
  matches: GroupMatch[];
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches }) => {
  const { t } = useLanguage();

  const semi1 = matches.find(m => m.group === "Semi Final 1")?.matchList[0];
  const semi2 = matches.find(m => m.group === "Semi Final 2")?.matchList[0];
  const thirdPlace = matches.find(m => m.group === "Third Place")?.matchList[0];
  const final = matches.find(m => m.group === "Final")?.matchList[0];

  const getMatchWinner = (match: Match | undefined) => {
    if (!match?.score) return null;
    let setsA = 0, setsB = 0;
    [match.score.set1, match.score.set2, match.score.set3].forEach(set => {
      if (set.a > set.b) setsA++;
      if (set.b > set.a) setsB++;
    });
    if (setsA > setsB) return match.teamA;
    if (setsB > setsA) return match.teamB;
    return null;
  };

  const renderMatchCard = (match: Match | undefined, title: string, isGold = false, isBronze = false) => {
    if (!match) return null;

    const winner = getMatchWinner(match);
    
    return (
      <div className={`bg-white rounded-xl shadow-lg border-2 p-4 ${
        isGold ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' :
        isBronze ? 'border-amber-600 bg-gradient-to-br from-amber-50 to-amber-100' :
        'border-slate-200'
      }`}>
        <div className={`text-center text-sm font-bold mb-3 ${
          isGold ? 'text-yellow-700' : isBronze ? 'text-amber-700' : 'text-slate-600'
        }`}>
          {isGold && <Trophy className="w-4 h-4 inline mr-1" />}
          {isBronze && <Medal className="w-4 h-4 inline mr-1" />}
          {title}
        </div>
        
        <div className="space-y-2">
          <div className={`p-2 rounded-lg text-center text-sm font-medium ${
            winner?.id === match.teamA.id ? 'bg-green-100 text-green-800 ring-2 ring-green-300' :
            'bg-slate-50 text-slate-600'
          }`}>
            {match.teamA.name}
          </div>
          
          <div className="text-center text-xs text-slate-400">vs</div>
          
          <div className={`p-2 rounded-lg text-center text-sm font-medium ${
            winner?.id === match.teamB.id ? 'bg-green-100 text-green-800 ring-2 ring-green-300' :
            'bg-slate-50 text-slate-600'
          }`}>
            {match.teamB.name}
          </div>
        </div>

        {match.score && (
          <div className="mt-3 text-xs text-center text-slate-500">
            {/* Score display can be added here */}
          </div>
        )}
      </div>
    );
  };

  const semiFinals = [semi1, semi2].filter(Boolean);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 sm:space-y-12 py-4 sm:py-8">
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
        <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{t('bracket')}</h2>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-8">
          {/* Semi Finals */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{t('semiFinals')}</h3>
            <div className="space-y-4">
              {semiFinals.map((m, i) => (
                <div key={i}>{renderMatchCard(m, `${t('semiFinals')} ${i + 1}`)}</div>
              ))}
            </div>
          </div>
          
          {/* Finals */}
          {final && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{t('finals')}</h3>
              <div>{renderMatchCard(final, t('finals'), true)}</div>
            </div>
          )}
          
          {/* Third Place */}
          {thirdPlace && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{t('thirdPlace')}</h3>
              <div>{renderMatchCard(thirdPlace, t('thirdPlace'), false, true)}</div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:grid grid-cols-3 gap-8 items-center">
          {/* Semi Finals Column */}
          <div className="space-y-12">
            {semiFinals.map((m, i) => (
               <div key={i}>{renderMatchCard(m, `${t('semiFinals')} ${i + 1}`)}</div>
            ))}
          </div>

          {/* Finals Column */}
          <div className="space-y-12 pt-8">
             <div>{renderMatchCard(final, t('finals'), true)}</div>
          </div>
          
           {/* Third Place Column */}
           <div className="pt-32 opacity-80 scale-90">
             <div>{renderMatchCard(thirdPlace, t('thirdPlace'), false, true)}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

