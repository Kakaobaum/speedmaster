import React, { useEffect } from "react";
import { Music, Play, Home } from "lucide-react"; // Icons for visual elements
import { useAudio } from "../hooks/useAudio"; // Hook for audio functionalities

interface GameOverProps {
  score: number; // Player's score in the current game
  highScore: number; // Player's all-time high score
  onRestart: () => void; // Function to restart the game
  onExit: () => void; // Function to return to the main menu
}

export function GameOver({
  score,
  highScore,
  onRestart,
  onExit,
}: GameOverProps) {
  const { speak } = useAudio(); // Access the speak function for text-to-speech

  useEffect(() => {
    // Announce game-over details and instructions via text-to-speech
    speak(
      `Game Over! Your score is ${score} points. Your high score is ${highScore} points. Press Space bar to play again, or Escape to return to the main menu.`
    );
  }, [score, highScore, speak]);

  useEffect(() => {
    // Handle keyboard input for restart and exit actions
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        onRestart(); // Restart game on Space bar
      } else if (event.key === "Escape") {
        onExit(); // Exit to main menu on Escape
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress); // Cleanup listener
  }, [onRestart, onExit]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <Music className="w-16 h-16 text-white mb-8" /> {/* Game Over icon */}
      <h2 className="text-4xl font-bold text-white mb-8">Game Over!</h2>{" "}
      {/* Game Over message */}
      <div className="text-white text-xl space-y-2 mb-8">
        <p>Score: {score}</p> {/* Display current score */}
        <p>High Score: {highScore}</p> {/* Display high score */}
      </div>
      {/* Buttons for restarting or exiting the game */}
      <div className="space-y-4">
        <button
          onClick={onRestart}
          className="w-64 flex items-center justify-center space-x-3 px-6 py-4 bg-white text-black rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          <Play className="w-6 h-6" />
          <span>Play Again (Space)</span> {/* Restart button */}
        </button>

        <button
          onClick={onExit}
          className="w-64 flex items-center justify-center space-x-3 px-6 py-4 bg-white text-black rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          <Home className="w-6 h-6" />
          <span>Main Menu (Esc)</span> {/* Exit button */}
        </button>
      </div>
    </div>
  );
}
