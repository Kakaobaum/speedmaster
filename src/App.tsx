import React, { useState, useEffect, useCallback, useRef } from "react";
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

  const generateNote = useCallback(() => {
    const keys = Object.keys(NOTES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      key: randomKey,
      ...NOTES[randomKey],
    };
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    playWrong();
    setGameState((prev) => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      try {
        localStorage.setItem("speedmaster-highscore", newHighScore.toString());
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      return {
        ...prev,
        isPlaying: false,
        screen: "gameover",
        currentNote: null,
        highScore: newHighScore,
      };
    });
  }, [playWrong]);

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

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (
        !gameState.isPlaying ||
        gameState.screen !== "game" ||
        !gameState.currentNote
      )
        return;

      if (event.key.toUpperCase() === gameState.currentNote.key) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }

        playCorrect();
        const newScore = gameState.score + POINTS_PER_NOTE;
        const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;
        const newTimeWindow = Math.max(
          MIN_TIME_WINDOW,
          INITIAL_TIME_WINDOW - (newLevel - 1) * TIME_WINDOW_DECREASE
        );

        if (newLevel > prevLevelRef.current) {
          speak(`Level ${newLevel}! Speed increased!`);
          prevLevelRef.current = newLevel;
        }

        setGameState((prev) => ({
          ...prev,
          score: newScore,
          level: newLevel,
          timeWindow: newTimeWindow,
          highScore: Math.max(prev.highScore, newScore),
          currentNote: null,
        }));
      } else {
        endGame();
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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="flex items-center mb-8">
        <h1 className="text-4xl font-bold text-white">SpeedMaster</h1>
      </div>

      <div className="mb-8 text-white text-xl">
        <p>Score: {gameState.score}</p>
        <p>Level: {gameState.level}</p>
        <p>Time Window: {(gameState.timeWindow / 1000).toFixed(1)}s</p>
      </div>

      <div className="w-full max-w-lg h-2 bg-gray-700 rounded-full mb-8 overflow-hidden">
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

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(NOTES).map(([key, note]) => (
          <div
            key={key}
            className={`w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200
              ${
                gameState.currentNote?.key === key
                  ? "scale-110 ring-4 ring-white animate-pulse"
                  : ""
              }
            `}
            style={{
              backgroundColor: note.color,
            }}
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
