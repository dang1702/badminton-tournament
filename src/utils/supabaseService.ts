import { supabase } from './supabaseClient';
import type { GroupMatch, MatchScore, Team } from './tournamentUtils';

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
    phase: m.phase
  }));
};

export const createMatches = async (matches: GroupMatch[]): Promise<void> => {
  try {
    await clearAllMatches();
    
    const matchesToInsert = matches.flatMap(group => 
      group.matchList.map(match => ({
        id: match.id,
        group: group.group,
        team_a_id: match.teamA.id,
        team_a_name: match.teamA.name,
        team_b_id: match.teamB.id,
        team_b_name: match.teamB.name,
        score: match.score || { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } },
        phase: group.phase || 1
      }))
    );

    const { error } = await supabase
      .from('matches')
      .insert(matchesToInsert);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating matches:', error);
    throw error;
  }
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

// --- Admin User Management ---
export const fetchAdminUsers = async () => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const approveAdmin = async (userId: string) => {
  const { error } = await supabase
    .from('admin_users')
    .update({ approved: true })
    .eq('id', userId);
  if (error) throw error;
};
