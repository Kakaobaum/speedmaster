import React, { useState, useEffect, useCallback, useRef } from "react";
// Import constants, components, and utilities
import {
  NOTES,
  INITIAL_TIME_WINDOW,
  MIN_TIME_WINDOW,
  TIME_WINDOW_DECREASE,
  POINTS_PER_NOTE,
  LEVEL_THRESHOLD,
} from "./constants";
import { Tutorial } from "./components/Tutorial";
import { GameOver } from "./components/GameOver";
import { MainMenu } from "./components/MainMenu";
import { useAudio } from "./hooks/useAudio";
import type { GameState } from "./types";

// List of motivational messages shown to players during gameplay
const ENCOURAGEMENTS = [
  "Great job!",
  "You're on fire!",
  "Keep it up!",
  "Fantastic!",
  "Amazing speed!",
  "You're crushing it!",
  "Incredible!",
  "Perfect timing!",
  "You're a natural!",
  "Outstanding!",
];

// Retrieve the high score from localStorage, or return 0 if unavailable
const getInitialHighScore = () => {
  try {
    const saved = localStorage.getItem("speedmaster-highscore");
    return saved ? parseInt(saved, 10) : 0;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return 0;
  }
};

function App() {
  // Define the game state and refs
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentNote: null,
    isPlaying: false,
    timeWindow: INITIAL_TIME_WINDOW,
    highScore: getInitialHighScore(),
    screen: "menu",
    level: 1,
  });

  const timerRef = useRef<NodeJS.Timeout>();
  const prevLevelRef = useRef(1);
  const { playNote, playCorrect, playWrong, speak } = useAudio();

  // Generate a random note for the player
  const generateNote = useCallback(() => {
    const keys = Object.keys(NOTES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      key: randomKey,
      ...NOTES[randomKey],
    };
  }, []);

  // Ends the current game session
  const endGame = useCallback(() => {
    // Clear any active timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    playWrong(); // Play a sound indicating a wrong move
    setGameState((prev) => {
      // Update the high score if needed
      const newHighScore = Math.max(prev.score, prev.highScore);
      try {
        localStorage.setItem("speedmaster-highscore", newHighScore.toString());
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      // Transition to the game over screen
      return {
        ...prev,
        isPlaying: false,
        screen: "gameover",
        currentNote: null,
        highScore: newHighScore,
      };
    });
  }, [playWrong]);

  // Handles user pressing a note key
  const handleNotePress = useCallback(
    (pressedKey: string) => {
      // Ignore key presses if the game is not active
      if (
        !gameState.isPlaying ||
        gameState.screen !== "game" ||
        !gameState.currentNote
      )
        return;

      if (pressedKey === gameState.currentNote.key) {
        // Player pressed the correct key
        if (timerRef.current) {
          clearTimeout(timerRef.current); // Reset the timer
          timerRef.current = undefined;
        }

        playCorrect(); // Play a sound for correct input
        const newScore = gameState.score + POINTS_PER_NOTE;
        const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;
        const newTimeWindow = Math.max(
          MIN_TIME_WINDOW,
          INITIAL_TIME_WINDOW - (newLevel - 1) * TIME_WINDOW_DECREASE
        );

        // Notify the player about level-up events
        if (newLevel > prevLevelRef.current) {
          speak(`Level ${newLevel}! Speed increased!`);
          prevLevelRef.current = newLevel;
        }
        if (newScore % 30 === 0) {
          // Show motivational messages
          const randomEncouragement =
            ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
          speak(randomEncouragement);
        }
        // Update game state with new progress
        setGameState((prev) => ({
          ...prev,
          score: newScore,
          level: newLevel,
          timeWindow: newTimeWindow,
          highScore: Math.max(prev.highScore, newScore),
          currentNote: null,
        }));
      } else {
        endGame(); // End game on incorrect input
      }
    },
    [
      gameState.currentNote,
      gameState.score,
      gameState.isPlaying,
      gameState.screen,
      playCorrect,
      endGame,
      speak,
    ]
  );

  // Handles keyboard input for note presses
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      handleNotePress(event.key.toUpperCase());
    },
    [handleNotePress]
  );

  // Generate notes and manage game logic
  useEffect(() => {
    if (
      gameState.isPlaying &&
      gameState.screen === "game" &&
      !gameState.currentNote
    ) {
      const note = generateNote();

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }

      setGameState((prev) => ({ ...prev, currentNote: note }));
      playNote(note.key);

      // Set a timer to end the game if the player takes too long
      timerRef.current = setTimeout(endGame, gameState.timeWindow);
    }
  }, [
    gameState.isPlaying,
    gameState.currentNote,
    gameState.screen,
    gameState.timeWindow,
    generateNote,
    playNote,
    endGame,
  ]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Listen for keyboard events during the game
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Start a new game session
  const startGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    prevLevelRef.current = 1;
    setGameState((prev) => ({
      ...prev,
      score: 0,
      isPlaying: true,
      timeWindow: INITIAL_TIME_WINDOW,
      level: 1,
      screen: "game",
      currentNote: null,
    }));
  }, []);

  // Render different screens based on the game state
  if (gameState.screen === "menu") {
    return (
      <MainMenu
        onStartGame={startGame}
        onStartTutorial={() =>
          setGameState((prev) => ({ ...prev, screen: "tutorial" }))
        }
      />
    );
  }

  if (gameState.screen === "tutorial") {
    return (
      <Tutorial
        onComplete={startGame}
        onExit={() => setGameState((prev) => ({ ...prev, screen: "menu" }))}
      />
    );
  }

  if (gameState.screen === "gameover") {
    return (
      <GameOver
        score={gameState.score}
        highScore={gameState.highScore}
        onRestart={startGame}
        onExit={() => setGameState((prev) => ({ ...prev, screen: "menu" }))}
      />
    );
  }

  // Main game UI for active gameplay
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="flex items-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white">
          SpeedMaster
        </h1>
      </div>

      {/* Display the player's score, level, and time window */}
      <div className="mb-4 sm:mb-8 text-white text-lg sm:text-xl">
        <p>Score: {gameState.score}</p>
        <p>Level: {gameState.level}</p>
        <p>Time Window: {(gameState.timeWindow / 1000).toFixed(1)}s</p>
      </div>

      {/* Animated timer bar */}
      <div className="w-full max-w-lg h-2 bg-gray-700 rounded-full mb-4 sm:mb-8 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{
            width: "100%",
            animation: gameState.currentNote
              ? `shrink ${gameState.timeWindow}ms linear forwards`
              : "none",
          }}
        />
      </div>

      {/* Note buttons for gameplay */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 w-full max-w-lg">
        {Object.entries(NOTES).map(([key, note]) => (
          <button
            key={key}
            onClick={() => handleNotePress(key)}
            className={`aspect-square rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-200 active:scale-95
              ${
                gameState.currentNote?.key === key
                  ? "scale-110 ring-4 ring-white animate-pulse"
                  : ""
              }
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
            `}
            style={{
              backgroundColor: note.color,
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
