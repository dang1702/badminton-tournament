import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'vi';

interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

const translations: Translations = {
  // Header
  appTitle: { en: 'QHBadminton', vi: 'QHBadminton' },
  appSubtitle: { en: 'Tournament Manager', vi: 'Quản Lý Giải Đấu' },
  
  // Team Manager
  teamRegistration: { en: 'Team Registration', vi: 'Đăng Ký Đội' },
  enterTeamName: { en: 'Enter team name...', vi: 'Nhập tên đội...' },
  add: { en: 'Add', vi: 'Thêm' },
  teams: { en: 'Teams', vi: 'Đội' },
  noTeams: { en: 'No teams registered yet', vi: 'Chưa có đội nào đăng ký' },
  addTeamsHint: { en: 'Add teams to start the tournament', vi: 'Thêm đội để bắt đầu giải đấu' },
  
  // Controls
  controlCenter: { en: 'Control Center', vi: 'Bảng Điều Khiển' },
  tournamentControl: { en: 'Tournament Control', vi: 'Điều Khiển Giải Đấu' },
  genGroups: { en: 'Generate Groups', vi: 'Chia Bảng (2 Bảng)' },
  startGroupStage: { en: 'Start Group Stage', vi: 'Bắt Đầu Vòng Bảng' },
  phaseGroup: { en: 'Phase: Group Stage', vi: 'Giai Đoạn: Vòng Bảng' },
  phaseGroupDesc: { en: 'Winners of each match advance to Ranking Round.', vi: 'Đội thắng mỗi trận sẽ vào Vòng Phân Hạng.' },
  startRankingRound: { en: 'Start Ranking Round', vi: 'Bắt Đầu Vòng Phân Hạng' },
  phaseRanking: { en: 'Phase: Ranking Round', vi: 'Giai Đoạn: Phân Hạng' },
  phaseRankingDesc: { en: 'Top 3 teams play round robin to determine 1st & 2nd.', vi: 'Top 3 đấu vòng tròn để chọn Nhất & Nhì.' },
  genKnockout: { en: 'Generate Knockout', vi: 'Tạo Vòng Loại Trực Tiếp' },
  
  // Tabs
  groups: { en: 'Groups', vi: 'Bảng Đấu' },
  matches: { en: 'Matches', vi: 'Lịch Đấu' },
  standings: { en: 'Standings', vi: 'Xếp Hạng' },
  bracket: { en: 'Bracket', vi: 'Nhánh Đấu' },
  
  // Group Display
  qualifyingGroups: { en: 'Qualifying Groups', vi: 'Bảng Đấu Vòng Loại' },
  groupStageDist: { en: 'Group stage distribution', vi: 'Danh sách chia bảng' },
  zone: { en: 'Zone', vi: 'Khu Vực' },
  groupStage: { en: 'Group Stage', vi: 'Vòng Bảng' },
  rankingRound: { en: 'Ranking Round', vi: 'Vòng Phân Hạng' },
  
  // Matches
  matchSchedule: { en: 'Match Schedule & Scores', vi: 'Lịch Thi Đấu & Tỉ Số' },
  enterScores: { en: 'Enter scores to update standings', vi: 'Nhập tỉ số để cập nhật xếp hạng' },
  sets: { en: 'SETS', vi: 'SÉC' },
  vs: { en: 'VS', vi: 'VS' },
  
  // Standings
  top3Advance: { en: 'Winners Advance', vi: 'Người Thắng Đi Tiếp' },
  played: { en: 'P', vi: 'Trận' },
  won: { en: 'W', vi: 'Thắng' },
  lost: { en: 'L', vi: 'Thua' },
  
  // Knockout
  semiFinals: { en: 'Semi-Finals', vi: 'Bán Kết' },
  finals: { en: 'Finals', vi: 'Chung Kết' },
  thirdPlace: { en: 'Third Place', vi: 'Tranh Hạng Ba' },
  winner: { en: 'Winner', vi: 'Vô Địch' },
  
  // Common
  requires12Teams: { en: 'Requires at least 12 teams to generate groups.', vi: 'Cần ít nhất 12 đội để tạo giải đấu.' },
  genGroupsFirst: { en: 'Please generate groups first.', vi: 'Vui lòng chia bảng trước.' },
  readyToStart: { en: 'Ready to Start?', vi: 'Sẵn Sàng Bắt Đầu?' },
  readyDesc: { 
    en: 'Add at least 12 teams to the list and click Generate Groups to begin.', 
    vi: 'Thêm ít nhất 12 đội và nhấn Chia Bảng để bắt đầu.' 
  },
  resetTournament: { en: 'Reset Tournament', vi: 'Làm Mới Giải Đấu' },
  resetConfirm: { en: 'Are you sure? This will delete all match data but keep the teams.', vi: 'Bạn có chắc không? Hành động này sẽ xóa toàn bộ dữ liệu trận đấu nhưng giữ lại danh sách đội.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi'); // Default to Vietnamese as requested

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

