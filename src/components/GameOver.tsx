import React, { useEffect } from 'react';
import { Music, Play, Home } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onExit: () => void;
}

export function GameOver({ score, highScore, onRestart, onExit }: GameOverProps) {
  const { speak } = useAudio();

  useEffect(() => {
    speak(`Game Over! Your score is ${score} points. Your high score is ${highScore} points. Press Space bar to play again, or Escape to return to the main menu.`);
  }, [score, highScore, speak]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        onRestart();
      } else if (event.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRestart, onExit]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <Music className="w-16 h-16 text-white mb-8" />
      <h2 className="text-4xl font-bold text-white mb-8">Game Over!</h2>
      
      <div className="text-white text-xl space-y-2 mb-8">
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={onRestart}
          className="w-64 flex items-center justify-center space-x-3 px-6 py-4 bg-white text-black rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          <Play className="w-6 h-6" />
          <span>Play Again (Space)</span>
        </button>

        <button
          onClick={onExit}
          className="w-64 flex items-center justify-center space-x-3 px-6 py-4 bg-white text-black rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          <Home className="w-6 h-6" />
          <span>Main Menu (Esc)</span>
        </button>
      </div>
    </div>
  );
}