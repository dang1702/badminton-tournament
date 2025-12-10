import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { TeamManager } from "./components/TeamManager";
import { GroupDisplay } from "./components/GroupDisplay";
import { MatchList } from "./components/MatchList";
import { StandingsTable } from "./components/StandingsTable";
import { KnockoutBracket } from "./components/KnockoutBracket";
import { AuthModal } from "./components/AuthModal";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  divideGroups,
  generateRoundRobinMatches,
  generateKnockoutMatches,
  calculateStandings,
} from "./utils/tournamentUtils";
import type { Team, GroupMatch, TeamStats, Match } from "./utils/tournamentUtils";
import { Wand2, PlayCircle, Trophy, Medal, Loader2, RotateCcw, Shield, Eye } from "lucide-react";
import {
  fetchTeams,
  createTeam,
  deleteTeam,
  updateTeam,
  fetchSettings,
  updateSetting,
  fetchMatches,
  createMatches,
  updateMatchScoreDB,
  clearAllMatches,
} from "./utils/supabaseService";
import { supabase } from "./utils/supabaseClient";
import { AdminPanel } from "./components/AdminPanel";

const AppContent = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, hasPermission, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [miniGroups, setMiniGroups] = useState<{ [key: string]: Team[][] }>({});
  const [matches, setMatches] = useState<GroupMatch[]>([]);
  const [activeTab, setActiveTab] = useState<"groups" | "matches" | "standings" | "bracket">("groups");
  const [standings, setStandings] = useState<{ [key: string]: TeamStats[] }>({});
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setShowAuthModal(true);
        setLoading(false);
      } else {
        refreshData();
      }
    }
  }, [authLoading, user]);

  const refreshData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [dbTeams, dbSettings, dbMatches] = await Promise.all([
        fetchTeams(),
        fetchSettings(),
        fetchMatches(),
      ]);

      setTeams(dbTeams || []);
      
      if (dbSettings.phase) setPhase(dbSettings.phase);
      if (dbSettings.miniGroups) setMiniGroups(dbSettings.miniGroups);
      
      if (dbMatches && dbMatches.length > 0) {
        const groupedMatches: { [key: string]: any[] } = {};
        dbMatches.forEach((m: any) => {
          if (!groupedMatches[m.group]) groupedMatches[m.group] = [];
          groupedMatches[m.group].push(m);
        });

        const groupMatchList: GroupMatch[] = Object.keys(groupedMatches).sort().map(gName => ({
          group: gName,
          matchList: groupedMatches[gName].sort((a: Match, b: Match) => a.id.localeCompare(b.id))
        }));
        
        setMatches(groupMatchList);
        recalculateStandings(groupMatchList, dbSettings.phase, dbSettings.miniGroups);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          console.log('Change detected, refreshing silently...');
          refreshData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddTeam = async (name: string) => {
    try {
      const tempTeam = { id: Date.now(), name };
      setTeams([...teams, tempTeam]);
      
      const newTeam = await createTeam(name);
      setTeams(prev => prev.map(t => t.id === tempTeam.id ? newTeam : t));
    } catch (e) {
      console.error(e);
      refreshData(true);
    }
  };

  const handleUpdateTeam = async (id: number, newName: string) => {
    try {
      setTeams(teams.map(t => t.id === id ? { ...t, name: newName } : t));
      await updateTeam(id, newName);
    } catch (e) {
      console.error(e);
      refreshData(true);
    }
  };

  const handleRemoveTeam = async (id: number) => {
    try {
      setTeams(teams.filter((t) => t.id !== id));
      await deleteTeam(id);
    } catch (e) {
      console.error(e);
      refreshData(true);
    }
  };

  const handleResetTournament = async () => {
    if (!confirm(t('resetConfirm'))) return;

    try {
        setPhase(1);
        setMiniGroups({});
        setMatches([]);
        setStandings({});
        setActiveTab("groups");

        await clearAllMatches();
        await updateSetting('phase', 1);
        await updateSetting('miniGroups', {});
    } catch (e) {
        console.error("Reset failed", e);
        alert("Reset failed");
        refreshData(true);
    }
  };

  const handleGenerateMiniGroups = async () => {
    if (teams.length < 12) {
      alert(t('requires12Teams'));
      return;
    }
    const sortedTeams = [...teams]; 
    const groups = divideGroups(sortedTeams, 2);
    const newGroups = { A: [groups[0]], B: [groups[1]] };
    
    setMiniGroups(newGroups);
    setPhase(1.5);
    setMatches([]);
    setStandings({});
    setActiveTab("groups");

    await updateSetting('miniGroups', newGroups);
    await updateSetting('phase', 1.5);
    await clearAllMatches(); 
  };

  const handleUpdateGroups = async (newGroups: { [key: string]: Team[][] }) => {
    setMiniGroups(newGroups);
    await updateSetting('miniGroups', newGroups);
    if (matches.length > 0) {
        if(confirm("Groups updated. Clear existing matches to regenerate?")) {
            setMatches([]);
            await clearAllMatches();
            setPhase(1.5);
            await updateSetting('phase', 1.5);
        }
    }
  };

  const handleCreateGroupMatches = async () => {
    if (!miniGroups.A) return;
    const allMatches: GroupMatch[] = [];
    const finalGroups = [
      { name: "Group A", teams: [...miniGroups.A[0]] },
      { name: "Group B", teams: [...miniGroups.B[0]] },
    ];
    
    finalGroups.forEach((g) => {
      const matchList = generateKnockoutMatches(g.teams).map(m => ({
        ...m,
        score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } }
      }));
      allMatches.push({ group: g.name, matchList, phase: 2 });
    });

    setMatches(allMatches);
    setPhase(2);
    setActiveTab("matches");
    updateStandings(allMatches, finalGroups);

    await createMatches(allMatches);
    await updateSetting('phase', 2);
  };

  const handleStartRankingRound = async () => {
    const getWinners = (groupName: string) => {
        const groupMatch = matches.find(m => m.group === groupName);
        if (!groupMatch) return [];
        
        return groupMatch.matchList
            .map(m => {
                if (!m.score) return null;
                let setsA = 0;
                let setsB = 0;
                [m.score.set1, m.score.set2, m.score.set3].forEach(set => {
                    if (set.a > set.b) setsA++;
                    if (set.b > set.a) setsB++;
                });
                if (setsA > setsB) return m.teamA;
                if (setsB > setsA) return m.teamB;
                return null; 
            })
            .filter((t): t is Team => t !== null);
    };

    const winnersA = getWinners("Group A");
    const winnersB = getWinners("Group B");

    if (winnersA.length < 3 || winnersB.length < 3) {
      alert("Need 3 winners from each group. Please finish all matches.");
      return;
    }

    const rankingMatches: GroupMatch[] = [];
    const rankingGroups = [
      { name: "Ranking A", teams: winnersA },
      { name: "Ranking B", teams: winnersB },
    ];

    rankingGroups.forEach((g) => {
      const matchList = generateRoundRobinMatches(g.teams).map(m => ({
        ...m,
        score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } }
      }));
      rankingMatches.push({ group: g.name, matchList, phase: 3 });
    });

    setMatches(rankingMatches);
    setPhase(3);
    setActiveTab("matches");
    updateStandings(rankingMatches, rankingGroups);

    await clearAllMatches();
    await createMatches(rankingMatches);
    await updateSetting('phase', 3);
  };

  const handleCreateKnockout = async () => {
    const topA = standings["Ranking A"]?.slice(0, 2).map(s => s.team) || [];
    const topB = standings["Ranking B"]?.slice(0, 2).map(s => s.team) || [];

    if (topA.length < 2 || topB.length < 2) {
      alert("Need scores from Ranking Round.");
      return;
    }

    const A1 = topA[0];
    const A2 = topA[1];
    const B1 = topB[0];
    const B2 = topB[1];

    const semi1 = { 
        id: `semi1`, teamA: A1, teamB: B2, 
        score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } } 
    };
    const semi2 = { 
        id: `semi2`, teamA: B1, teamB: A2, 
        score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } } 
    };

    const knockoutMatches: GroupMatch[] = [
        { group: "Semi Final 1", matchList: [semi1], phase: 4 },
        { group: "Semi Final 2", matchList: [semi2], phase: 4 },
        { group: "Third Place", matchList: [{ id: 'third', teamA: {id:0, name:'Loser SF1'}, teamB: {id:0, name:'Loser SF2'}, score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } } }], phase: 4 },
        { group: "Final", matchList: [{ id: 'final', teamA: {id:0, name:'Winner SF1'}, teamB: {id:0, name:'Winner SF2'}, score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } } }], phase: 4 }
    ];

    setMatches(knockoutMatches);
    setPhase(4);
    setActiveTab("bracket");

    await clearAllMatches();
    await createMatches(knockoutMatches);
    await updateSetting('phase', 4);
  };

  const handleUpdateScore = async (matchId: string, setIndex: 1 | 2 | 3, team: 'a' | 'b', val: number) => {
    const updatedMatches = matches.map(group => ({
      ...group,
      matchList: group.matchList.map(m => {
        if (m.id === matchId) {
          const newScore = { ...m.score! };
          newScore[`set${setIndex}`][team] = val;
          return { ...m, score: newScore };
        }
        return m;
      })
    }));

    setMatches(updatedMatches);
    recalculateStandings(updatedMatches, phase, miniGroups);

    try {
        const matchToUpdate = updatedMatches.flatMap(g => g.matchList).find(m => m.id === matchId);
        if (matchToUpdate && matchToUpdate.score) {
            await updateMatchScoreDB(matchId, matchToUpdate.score);
        }
    } catch (e) {
        console.error("Failed to update score in DB", e);
        refreshData(true);
    }
  };

  const recalculateStandings = (currentMatches: GroupMatch[], currentPhase: number, currentGroups: any) => {
    if (currentPhase === 4) return;

    let targetGroups: {name: string, teams: Team[]}[] = [];
    
    if (currentPhase === 2 && currentGroups.A) {
       targetGroups = [
          { name: "Group A", teams: currentGroups.A[0] },
          { name: "Group B", teams: currentGroups.B[0] }
       ];
    } else if (currentPhase === 3) {
       const teamsA = currentMatches.find(g => g.group === "Ranking A")?.matchList.flatMap(m => [m.teamA, m.teamB]);
       const uniqueTeamsA = Array.from(new Map(teamsA?.map(t => [t.id, t])).values());
       
       const teamsB = currentMatches.find(g => g.group === "Ranking B")?.matchList.flatMap(m => [m.teamA, m.teamB]);
       const uniqueTeamsB = Array.from(new Map(teamsB?.map(t => [t.id, t])).values());

       if (uniqueTeamsA.length && uniqueTeamsB.length) {
         targetGroups = [
            { name: "Ranking A", teams: uniqueTeamsA as Team[] },
            { name: "Ranking B", teams: uniqueTeamsB as Team[] }
         ];
       }
    }

    if (targetGroups.length > 0) {
       updateStandings(currentMatches, targetGroups);
    }
  };

  const updateStandings = (currentMatches: GroupMatch[], groups: {name: string, teams: Team[]}[]) => {
    const newStandings: { [key: string]: TeamStats[] } = {};
    groups.forEach(g => {
      const groupMatch = currentMatches.find(m => m.group === g.name);
      if (groupMatch) {
        newStandings[g.name] = calculateStandings(g.teams, groupMatch.matchList);
      }
    });
    setStandings(newStandings);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <AuthModal isOpen={showAuthModal} onClose={() => {}} />
      </div>
    );
  }

  if (user.role === 'admin' && user.approved === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Not Available</h2>
          <p className="text-slate-600 mb-4">
            Your account does not have the required permissions. 
            Please contact the administrator to assign proper roles.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Email: {user.email}
            </p>
            <button
              onClick={() => {
                signOut();
                setShowAuthModal(true);
              }}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Connecting to Stadium Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-700">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {phase === 1 && hasPermission('write') && (
              <TeamManager 
                teams={teams} 
                onAddTeam={handleAddTeam}
                onUpdateTeam={handleUpdateTeam}
                onRemoveTeam={handleRemoveTeam}
              />
            )}

            {/* Admin Panel for all approved admins */}
            {user?.role === 'admin' && user?.approved === true && (
              <AdminPanel />
            )}

            {phase >= 2 && phase !== 4 && Object.keys(standings).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">{t('standings')}</h3>
                {Object.entries(standings).map(([name, stats]) => (
                  <StandingsTable key={name} groupName={name} stats={stats} />
                ))}
              </div>
            )}

            {hasPermission('write') && (
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/20">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t('controlCenter')}
                </h3>
                <div className="space-y-3">
                  {phase < 2 && (
                    <button
                      onClick={handleGenerateMiniGroups}
                      disabled={teams.length < 12}
                      className="group w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-5 h-5" />
                      {t('genGroups')}
                    </button>
                  )}
                  
                  {phase >= 1.5 && phase < 2 && (
                    <button
                      onClick={handleCreateGroupMatches}
                      className="group w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      {t('startGroupStage')}
                    </button>
                  )}

                  {phase === 2 && (
                    <div className="space-y-3">
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
                          <p className="font-medium mb-1">{t('phaseGroup')}</p>
                          <p className="opacity-80">{t('phaseGroupDesc')}</p>
                      </div>
                      <button
                          onClick={handleStartRankingRound}
                          className="group w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                          <Medal className="w-5 h-5" />
                          {t('startRankingRound')}
                      </button>
                    </div>
                  )}

                  {phase === 3 && (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
                          <p className="font-medium mb-1">{t('phaseRanking')}</p>
                          <p className="opacity-80">{t('phaseRankingDesc')}</p>
                      </div>
                      <button
                          onClick={handleCreateKnockout}
                          className="group w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                      >
                          <Trophy className="w-5 h-5" />
                          {t('genKnockout')}
                      </button>
                    </div>
                  )}

                  {phase > 1 && (
                      <button
                          onClick={handleResetTournament}
                          className="group w-full py-2 px-4 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4"
                      >
                          <RotateCcw className="w-4 h-4" />
                          {t('resetTournament')}
                      </button>
                  )}
                </div>
              </div>
            )}

            {user.role === 'guest' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-emerald-800">Guest Mode</h3>
                </div>
                <p className="text-sm text-emerald-700">
                  You're viewing in read-only mode. Contact an admin for editing access.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 min-h-[500px]">
            {(miniGroups.A || matches.length > 0) && (
              <div className="mb-8 flex p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
                {['groups', 'matches', 'standings', 'bracket'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        disabled={tab === 'bracket' && phase < 4}
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                            activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-700 disabled:opacity-40"
                        }`}
                    >
                        {t(tab)}
                    </button>
                ))}
              </div>
            )}

            <div className="relative">
              {activeTab === "groups" && (
                <GroupDisplay 
                  miniGroups={miniGroups} 
                  onUpdateGroups={hasPermission('write') ? handleUpdateGroups : undefined}
                  isEditable={phase < 2 && hasPermission('write')}
                />
              )}
              {activeTab === "matches" && (
                <MatchList 
                  matches={matches} 
                  onUpdateScore={hasPermission('write') ? handleUpdateScore : undefined} 
                />
              )}
              {activeTab === "standings" && phase !== 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                   {Object.entries(standings).map(([name, stats]) => (
                    <StandingsTable key={name} groupName={name} stats={stats} />
                  ))}
                </div>
              )}
              {activeTab === "bracket" && <KnockoutBracket matches={matches} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
