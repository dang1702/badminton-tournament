import React from 'react';
import type { TeamStats } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface StandingsTableProps {
  groupName: string;
  stats: TeamStats[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ groupName, stats }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white">
        <h3 className="font-bold text-lg">{groupName}</h3>
        <p className="text-sm opacity-90">{t('currentStandings')}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[140px]">
                {t('team')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                {t('played')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                {t('won')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                {t('lost')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">
                {t('setDiff')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">
                {t('ptDiff')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                {t('points')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map((stat, index) => (
              <tr 
                key={stat.team.id} 
                className={`hover:bg-slate-50 transition-colors ${
                  index < 3 ? 'bg-emerald-50/30' : ''
                }`}
              >
                <td className="px-3 py-3 text-sm font-medium text-slate-900">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                    index === 1 ? 'bg-gray-300 text-gray-700' : 
                    index === 2 ? 'bg-amber-600 text-white' : 
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  <div className="flex items-center">
                    <span className="truncate">{stat.team.name}</span>
                    {index < 3 && (
                      <span className="ml-2 text-xs text-emerald-600 font-medium">
                        ✓
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-sm text-slate-600">
                  {stat.played}
                </td>
                <td className="px-3 py-3 text-center text-sm font-medium text-emerald-600">
                  {stat.won}
                </td>
                <td className="px-3 py-3 text-center text-sm font-medium text-red-600">
                  {stat.lost}
                </td>
                <td className="px-3 py-3 text-center text-sm font-medium">
                  <span className={stat.setsDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {stat.setsDiff >= 0 ? '+' : ''}{stat.setsDiff}
                  </span>
                </td>
                <td className="px-3 py-3 text-center text-sm font-medium">
                  <span className={stat.pointsDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {stat.pointsDiff >= 0 ? '+' : ''}{stat.pointsDiff}
                  </span>
                </td>
                <td className="px-3 py-3 text-center text-sm font-bold text-slate-900">
                  {stat.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {stats.length >= 3 && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100">
          <p className="text-xs text-emerald-700 font-medium">
            {t('top3Advance')}
          </p>
        </div>
      )}
    </div>
  );
};
