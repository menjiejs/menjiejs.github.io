export interface Player {
  id: string;
  name: string;
  rank: string;
  health: number;
  maxHealth: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  isReady: boolean;
  teamId?: string;
}

export interface GameSession {
  id: string;
  roomId: string;
  roomName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Player[];
  currentQuestionId?: string;
  monster: {
    id: string;
    name: string;
    rank: string;
    maxHealth: number;
    currentHealth: number;
  };
  gameMode: 'solo' | 'team' | 'competitive';
  status: 'waiting' | 'playing' | 'finished';
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameState {
  session: GameSession;
  currentQuestion?: any;
  lastAnswer?: {
    playerId: string;
    isCorrect: boolean;
    timeSpent: number;
  };
}

export interface CreateSessionData {
  roomId: string;
  roomName: string;
  maxPlayers?: number;
  gameMode: 'solo' | 'team' | 'competitive';
}