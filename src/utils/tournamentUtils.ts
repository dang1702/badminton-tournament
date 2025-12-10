export interface Team {
  id: number;
  name: string;
}

export interface MatchScore {
  set1: { a: number; b: number };
  set2: { a: number; b: number };
  set3: { a: number; b: number };
}

export interface Match {
  id: string; // Added ID for updates
  teamA: Team;
  teamB: Team;
  score?: MatchScore;
  winnerId?: number;
}

export interface Group {
  name: string;
  teams: Team[];
}

export interface GroupMatch {
  group: string;
  matchList: Match[];
  phase?: number; // Add phase property
}

export interface TeamStats {
  team: Team;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  setsDiff: number; // Add this
  pointsWon: number;
  pointsLost: number;
  pointsDiff: number;
  points: number; // Add this (match points, usually 3 for win, 1 for loss, 0 for no-show)
}

// Helpers
export const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const generateRoundRobinMatches = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ 
        id: `${teams[i].id}-${teams[j].id}`,
        teamA: teams[i], 
        teamB: teams[j] 
      });
    }
  }
  return matches;
};

// New: Generate Knockout Matches (Internal Elimination)
export const generateKnockoutMatches = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  // Ensure we have even number of teams, or handle bye (simple version: ignore odd team)
  // Teams are assumed to be shuffled already
  for (let i = 0; i < teams.length; i += 2) {
    if (i + 1 < teams.length) {
       matches.push({
         id: `ko-${teams[i].id}-${teams[i+1].id}`,
         teamA: teams[i],
         teamB: teams[i+1]
       });
    }
  }
  return matches;
};

export const divideGroups = <T,>(list: T[], g: number): T[][] => {
  const per = Math.ceil(list.length / g);
  const result: T[][] = [];

  for (let i = 0; i < g; i++) {
    const startIndex = i * per;
    const endIndex = startIndex + per;
    const slice = list.slice(startIndex, endIndex);
    if (slice.length > 0) {
      result.push(slice);
    }
  }
  return result;
};

export const calculateStandings = (teams: Team[], matches: Match[]): TeamStats[] => {
  const stats: { [key: number]: TeamStats } = {};

  // Initialize
  teams.forEach(t => {
    stats[t.id] = {
      team: t,
      played: 0,
      won: 0,
      lost: 0,
      setsWon: 0,
      setsLost: 0,
      setsDiff: 0, // Add this
      pointsWon: 0,
      pointsLost: 0,
      pointsDiff: 0,
      points: 0 // Add this
    };
  });

  matches.forEach(m => {
    if (!m.score) return;

    // Check if match is "played" (at least one set has scores)
    const isPlayed = (m.score.set1.a > 0 || m.score.set1.b > 0);
    if (!isPlayed) return;

    const teamA = stats[m.teamA.id];
    const teamB = stats[m.teamB.id];

    if (teamA && teamB) {
      teamA.played++;
      teamB.played++;

      // Calculate Sets
      let setsA = 0;
      let setsB = 0;

      [m.score.set1, m.score.set2, m.score.set3].forEach(set => {
        if (set.a === 0 && set.b === 0) return; // Skip unplayed sets
        
        teamA.pointsWon += set.a;
        teamA.pointsLost += set.b;
        teamB.pointsWon += set.b;
        teamB.pointsLost += set.a;

        if (set.a > set.b) setsA++;
        if (set.b > set.a) setsB++;
      });

      teamA.setsWon += setsA;
      teamA.setsLost += setsB;
      teamB.setsWon += setsB;
      teamB.setsLost += setsA;

      // Determine Winner and assign match points
      if (setsA > setsB) {
        teamA.won++;
        teamB.lost++;
        teamA.points += 3; // 3 points for win
        teamB.points += 0; // 0 points for loss
      } else if (setsB > setsA) {
        teamB.won++;
        teamA.lost++;
        teamB.points += 3; // 3 points for win
        teamA.points += 0; // 0 points for loss
      }
      
      // Update Diffs
      teamA.setsDiff = teamA.setsWon - teamA.setsLost;
      teamB.setsDiff = teamB.setsWon - teamB.setsLost;
      teamA.pointsDiff = teamA.pointsWon - teamA.pointsLost;
      teamB.pointsDiff = teamB.pointsWon - teamB.pointsLost;
    }
  });

  return Object.values(stats).sort((a, b) => {
    // Sort by match points first
    if (b.points !== a.points) return b.points - a.points;
    // Then by sets difference
    if (b.setsDiff !== a.setsDiff) return b.setsDiff - a.setsDiff;
    // Finally by points difference
    return b.pointsDiff - a.pointsDiff;
  });
};
