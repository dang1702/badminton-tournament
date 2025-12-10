import { supabase } from './supabaseClient';
import type { Match, MatchScore, Team } from './tournamentUtils';

// --- Teams ---
export const fetchTeams = async () => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Team[];
};

export const createTeam = async (name: string) => {
  const { data, error } = await supabase
    .from('teams')
    .insert([{ name }])
    .select()
    .single();
  if (error) throw error;
  return data as Team;
};

export const deleteTeam = async (id: number) => {
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw error;
};

export const updateTeam = async (id: number, name: string): Promise<Team> => {
  const { data, error } = await supabase
    .from('teams')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// --- Settings (Global State) ---
export const fetchSettings = async () => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  
  // Convert array to object map
  const settings: any = {};
  data.forEach((row: any) => {
    settings[row.key] = row.value;
  });
  return settings;
};

export const updateSetting = async (key: string, value: any) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
};

// --- Matches ---
export const fetchMatches = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      teamA:teams!team_a_id(*),
      teamB:teams!team_b_id(*)
    `)
    .order('id', { ascending: true }); // Ensure fixed order
  
  if (error) throw error;

  // Transform DB format to App format
  // DB has team_a_id, team_b_id. We need to map relation to teamA object
  return data.map((m: any) => ({
    id: m.id,
    group: m.group_name,
    teamA: m.teamA,
    teamB: m.teamB,
    score: m.score,
    winnerId: m.winner_id,
    phase: m.phase
  }));
};

export const createMatches = async (matches: any[]) => {
  // matches input format is App format (GroupMatch[]). Need to flatten to DB rows
  const rows: any[] = [];
  
  matches.forEach(group => {
    group.matchList.forEach((m: Match) => {
      rows.push({
        id: m.id,
        group_name: group.group,
        team_a_id: m.teamA.id,
        team_b_id: m.teamB.id,
        score: m.score,
        winner_id: m.winnerId || null,
        phase: group.phase || 2 // Default to group phase if not specified
      });
    });
  });

  const { error } = await supabase.from('matches').upsert(rows);
  if (error) throw error;
};

export const updateMatchScoreDB = async (matchId: string, score: MatchScore) => {
  const { error } = await supabase
    .from('matches')
    .update({ score })
    .eq('id', matchId);
  if (error) throw error;
};

export const clearAllMatches = async () => {
  const { error } = await supabase.from('matches').delete().neq('id', 'placeholder');
  if (error) throw error;
};
