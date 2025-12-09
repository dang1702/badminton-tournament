import React from 'react';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import type { TeamStats } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface StandingsTableProps {
  groupName: string;
  stats: TeamStats[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ groupName, stats }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-slate-800">{groupName}</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-white border rounded">
          {t('top3Advance')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-2 w-10">#</th>
              <th className="px-4 py-2">{t('teams')}</th>
              <th className="px-2 py-2 text-center w-12">{t('played')}</th>
              <th className="px-2 py-2 text-center w-12">{t('won')}</th>
              <th className="px-2 py-2 text-center w-12">{t('lost')}</th>
              <th className="px-2 py-2 text-center w-16">Set +/-</th>
              <th className="px-2 py-2 text-center w-16">Pt +/-</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map((stat, index) => {
              const isQualifying = index < 3;
              return (
                <tr 
                  key={stat.team.id} 
                  className={`
                    ${isQualifying ? 'bg-indigo-50/30' : 'bg-white'} 
                    hover:bg-slate-50 transition-colors
                  `}
                >
                  <td className="px-4 py-3 font-medium text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      {stat.team.name}
                      {isQualifying && (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-slate-600">{stat.played}</td>
                  <td className="px-2 py-3 text-center font-bold text-emerald-600">{stat.won}</td>
                  <td className="px-2 py-3 text-center text-red-500">{stat.lost}</td>
                  <td className="px-2 py-3 text-center text-slate-500">
                    {stat.setsWon}-{stat.setsLost}
                  </td>
                  <td className="px-2 py-3 text-center text-slate-500">
                    {stat.pointsDiff > 0 ? '+' : ''}{stat.pointsDiff}
                  </td>
                </tr>
              );
            })}
            {stats.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-5 h-5 opacity-50" />
                    No matches played yet
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
