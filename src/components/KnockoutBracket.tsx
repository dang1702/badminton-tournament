import { Trophy } from 'lucide-react';
import type { GroupMatch } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface KnockoutBracketProps {
  matches: GroupMatch[];
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches }) => {
  const { t } = useLanguage();
  if (matches.length === 0) return null;

  // Assuming matches are ordered: Semi 1, Semi 2, 3rd Place, Final
  const semiFinals = matches.filter(m => m.group.includes('Semi'));
  const thirdPlace = matches.find(m => m.group.includes('Third'));
  const final = matches.find(m => m.group.includes('Final') && !m.group.includes('Semi'));

  const renderMatchCard = (matchData: any, title: string, isFinal = false) => {
    if (!matchData || !matchData.matchList[0]) return null;
    const match = matchData.matchList[0];
    
    // Determine winner for styling
    const winnerId = match.winnerId;
    
    return (
      <div className={`
        bg-white rounded-xl border-2 shadow-sm p-4 relative overflow-hidden transition-all hover:scale-105 duration-300
        ${isFinal ? 'border-amber-400 shadow-amber-100' : 'border-slate-200'}
      `}>
        {isFinal && <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] px-2 py-0.5 font-bold rounded-bl-lg">TROPHY</div>}
        
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isFinal ? 'text-amber-600' : 'text-slate-400'}`}>
          {title}
        </h4>
        
        <div className="space-y-2">
          {/* Team A */}
          <div className={`flex justify-between items-center p-2 rounded-lg ${match.score?.set1.a > match.score?.set1.b || winnerId === match.teamA.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-50 text-slate-600'}`}>
            <span className="truncate">{match.teamA.name}</span>
            <span className="text-sm">{match.score?.set1.a || 0}</span>
          </div>
          
          {/* Team B */}
          <div className={`flex justify-between items-center p-2 rounded-lg ${match.score?.set1.b > match.score?.set1.a || winnerId === match.teamB.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-50 text-slate-600'}`}>
            <span className="truncate">{match.teamB.name}</span>
            <span className="text-sm">{match.score?.set1.b || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 py-8">
      <div className="flex items-center justify-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-amber-500" />
        <h2 className="text-3xl font-bold text-slate-900">{t('bracket')}</h2>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Connecting Lines (Simplified for now) */}
        
        <div className="grid grid-cols-3 gap-8 items-center">
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
          
           {/* Third Place Column (Or separate) */}
           <div className="pt-32 opacity-80 scale-90">
             <div>{renderMatchCard(thirdPlace, t('thirdPlace'))}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

