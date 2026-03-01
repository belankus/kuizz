export interface DashboardMetricsType {
  metrics: {
    totalQuizzes: number;
    totalGamesHosted: number;
    totalPlayers: number;
    averageAccuracy: number;
  };
  gamesPerDay: {
    date: string;
    count: number;
  }[];
  recentGames: RecentGames[];
}

export interface RecentGames {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  totalPlayers: number;
}
