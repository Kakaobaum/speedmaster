import React, { useEffect } from "react";
import { Music, Play, BookOpen } from "lucide-react"; // Icons for menu options
import { useAudio } from "../hooks/useAudio"; // Hook for audio functionalities

interface MainMenuProps {
  onStartGame: () => void; // Function to start a new game
  onStartTutorial: () => void; // Function to start the tutorial
}

export function MainMenu({ onStartGame, onStartTutorial }: MainMenuProps) {
  const { speak } = useAudio(); // Access the speak function for text-to-speech
  const highScore = localStorage.getItem("speedmaster-highscore") || "0"; // Retrieve high score from localStorage

  useEffect(() => {
    // Announce welcome message and instructions via text-to-speech
    const welcomeMessage =
      "Welcome to SpeedMaster! " +
      `Your high score is ${highScore} points. ` +
      "Press the Space bar to start a new game. " +
      "Press T to start the tutorial and learn how to play. ";
    speak(welcomeMessage);
  }, [speak, highScore]);

  useEffect(() => {
    // Handle keyboard input for starting the game or tutorial
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        onStartGame(); // Start game on Space bar
      } else if (event.key.toLowerCase() === "t") {
        onStartTutorial(); // Start tutorial on 'T'
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress); // Cleanup listener
  }, [onStartGame, onStartTutorial]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* Title and logo */}
      <div className="flex items-center mb-12">
        <Music className="w-16 h-16 text-white mr-4" />
        <h1 className="text-6xl font-bold text-white">SpeedMaster</h1>
      </div>

      {/* High score display */}
      <p className="text-white text-xl mb-8">High Score: {highScore}</p>

      {/* Buttons for starting the game or tutorial */}
      <div className="space-y-6">
        <button
          onClick={onStartGame}
          className="w-64 flex items-center justify-center space-x-3 px-6 py-4 bg-white text-black rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          <Play className="w-6 h-6" />
          <span>Start Game (Space)</span> {/* Start game button */}
        </button>

        <button
          onClick={onStartTutorial}
          className="w-64 flex items-center justify-center space-x-3 px-6 py-4 bg-white text-black rounded-lg font-bold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          <BookOpen className="w-6 h-6" />
          <span>Tutorial (T)</span> {/* Start tutorial button */}
        </button>
      </div>
    </div>
  );
}
