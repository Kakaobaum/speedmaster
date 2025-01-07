export interface Note {
  key: string;
  color: string;
  frequency: number;
  name: string;
}

export interface GameState {
  score: number;
  currentNote: Note | null;
  isPlaying: boolean;
  timeWindow: number;
  highScore: number;
  screen: 'menu' | 'game' | 'tutorial' | 'gameover';
  level: number;
}