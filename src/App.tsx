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

// Array of positive feedback messages that can be spoken during gameplay
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

/**
 * Attempts to retrieve the saved high score from localStorage.
 * Returns 0 if no score is found or if there's an error.
 */
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
  /**
   * A ref to manage background music. Using `useRef` ensures
   * that the same HTMLAudioElement persists across renders.
   * https://audiocdn.epidemicsound.com/ES_ITUNES/6EHqvP_Nocturne/ES_Nocturne.mp3 - guitar
   * https://audiocdn.epidemicsound.com/lqmp3/01HXV7VRJ2AZFK25CF4M6F6WC2.mp3 - ocean waves
   * https://cdn.pixabay.com/audio/2025/01/13/audio_b4c259c69e.mp3 - beta waves
   * https://audiocdn.epidemicsound.com/ES_ITUNES/Chronicles%20Of%20Humming/ES_Chronicles%20Of%20Humming.mp3 - house beat
   */
  const backgroundMusicRef = useRef<HTMLAudioElement>(
    new Audio("https://audiocdn.epidemicsound.com/ES_ITUNES/Chronicles%20Of%20Humming/ES_Chronicles%20Of%20Humming.mp3")
  );
  // Make the audio loop indefinitely so it restarts once it ends
  backgroundMusicRef.current.loop = true;
  backgroundMusicRef.current.volume = 0.2;

  /**
   * The main game state.
   *  - score: current score
   *  - currentNote: the note the user must press
   *  - isPlaying: whether the game is currently active
   *  - timeWindow: how long the user has to press the correct note
   *  - highScore: top score retrieved from localStorage
   *  - screen: which screen ("menu", "tutorial", "game", "gameover")
   *  - level: current user level, used to adjust difficulty
   */
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentNote: null,
    isPlaying: false,
    timeWindow: INITIAL_TIME_WINDOW,
    highScore: getInitialHighScore(),
    screen: "menu",
    level: 1,
  });

  // A ref to hold the current timer so we can clear it when needed
  const timerRef = useRef<NodeJS.Timeout>();
  // A ref to remember the previous level so we know when to announce a level up
  const prevLevelRef = useRef(1);

  // Custom hook that provides audio playback functions
  const { playNote, playCorrect, playWrong, speak } = useAudio();

  /**
   * Picks a random note from the list of NOTES. Each note
   * has a 'color' and a 'key' property associated with it.
   */
  const generateNote = useCallback(() => {
    const keys = Object.keys(NOTES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      key: randomKey,
      ...NOTES[randomKey],
    };
  }, []);

  /**
   * Ends the game:
   *  1. Clears the current timer
   *  2. Plays a "wrong" sound
   *  3. Pauses and resets the background music
   *  4. Updates high score if necessary
   *  5. Transitions to "gameover" screen
   */
  const endGame = useCallback(() => {
    // Clear any active timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Play the wrong sound to indicate the user made a mistake
    playWrong();

    // Pause and reset background music
    backgroundMusicRef.current.pause();
    backgroundMusicRef.current.currentTime = 0;

    // Update game state to show the Game Over screen
    setGameState((prev) => {
      // Calculate new high score if the player did better than before
      const newHighScore = Math.max(prev.score, prev.highScore);
      // Attempt to persist the new high score in localStorage
      try {
        localStorage.setItem("speedmaster-highscore", newHighScore.toString());
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      // Return the updated state
      return {
        ...prev,
        isPlaying: false,
        screen: "gameover",
        currentNote: null,
        highScore: newHighScore,
      };
    });
  }, [playWrong]);

  /**
   * Handles logic when a user presses a note.
   *  - If it's correct, increment score, manage level and time window, etc.
   *  - If it's wrong, end the game.
   */
  const handleNotePress = useCallback(
    (pressedKey: string) => {
      // If the game isn't active or we don't have a current note, ignore presses
      if (
        !gameState.isPlaying ||
        gameState.screen !== "game" ||
        !gameState.currentNote
      )
        return;

      // Check if the user pressed the correct note
      if (pressedKey === gameState.currentNote.key) {
        // Clear the timer to avoid losing for inactivity
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }

        // Play the "correct" sound
        playCorrect();

        // Calculate the new score
        const newScore = gameState.score + POINTS_PER_NOTE;
        // Determine if the player has leveled up
        const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;
        // Decrease time window as levels go up (but not below MIN_TIME_WINDOW)
        const newTimeWindow = Math.max(
          MIN_TIME_WINDOW,
          INITIAL_TIME_WINDOW - (newLevel - 1) * TIME_WINDOW_DECREASE
        );

        // If the player has gained a level, let them know via text-to-speech
        if (newLevel > prevLevelRef.current) {
          speak(`Level ${newLevel}! Speed increased!`);
          prevLevelRef.current = newLevel;
        }

        // Every 30 points, provide a random encouragement message
        if (newScore % 60 === 0) {
          const randomEncouragement =
            ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
          speak(randomEncouragement);
        }

        // Update the game state with the new score, level, etc.
        setGameState((prev) => ({
          ...prev,
          score: newScore,
          level: newLevel,
          timeWindow: newTimeWindow,
          highScore: Math.max(prev.highScore, newScore),
          currentNote: null, // This will trigger the next note to be generated
        }));
      } else {
        // If the user pressed the wrong note, end the game
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

  /**
   * Converts keyboard events to uppercase strings and
   * passes them to 'handleNotePress'.
   */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      handleNotePress(event.key.toUpperCase());
    },
    [handleNotePress]
  );

  /**
   * Whenever a new note is needed (e.g., the old one was pressed or
   * right after starting the game), generate a new one and set a timer.
   * If the user doesn't press the correct note in time, we end the game.
   */
  useEffect(() => {
    // Only generate a new note if:
    //  1. The game is playing
    //  2. We are on the game screen
    //  3. We don't currently have a note
    if (
      gameState.isPlaying &&
      gameState.screen === "game" &&
      !gameState.currentNote
    ) {
      // Create a random note from our NOTES list
      const note = generateNote();

      // Clear any existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }

      // Update the game state with this new note
      setGameState((prev) => ({ ...prev, currentNote: note }));

      // Play the note (this could be a beep or some other short sound)
      playNote(note.key);

      // Set a timer that ends the game if the user does not press in time
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

  /**
   * Cleanup: on component unmount, clear any lingering timer
   * and pause background music to avoid memory leaks.
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      backgroundMusicRef.current.pause();
    };
  }, []);

  /**
   * Attach our keyboard event listener for the duration of the component’s life.
   * The listener will pass key presses to handleKeyPress, which decides what to do.
   */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  /**
   * Start a new game session:
   *  1. Clear any leftover timers
   *  2. Reset level reference
   *  3. Play background music
   *  4. Reset the game state to default for a fresh run
   */
  const startGame = useCallback(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Reset the prevLevelRef
    prevLevelRef.current = 1;

    // Attempt to play the background music from the start
    backgroundMusicRef.current.currentTime = 0;
    backgroundMusicRef.current
      .play()
      .catch((err) => console.warn("Autoplay failed:", err));

    // Reset the game state
    setGameState((prev) => ({
      ...prev,
      score: 0,
      isPlaying: true,
      timeWindow: INITIAL_TIME_WINDOW,
      level: 1,
      screen: "game",
      currentNote: null, // Will be generated in useEffect
    }));
  }, []);

  /**
   * Render different screens based on 'gameState.screen':
   *  - "menu" -> MainMenu
   *  - "tutorial" -> Tutorial
   *  - "gameover" -> GameOver
   *  - Otherwise, render the in-game UI
   */
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

  /**
   * If none of the above screens match, we're in the actual game screen.
   * Render the gameplay UI (score, timer bar, note buttons).
   */
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Title at the top */}
      <div className="flex items-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white">
          SpeedMaster
        </h1>
      </div>

      {/* Display some current stats: score, level, time window */}
      <div className="mb-4 sm:mb-8 text-white text-lg sm:text-xl">
        <p>Score: {gameState.score}</p>
        <p>Level: {gameState.level}</p>
        <p>Time Window: {(gameState.timeWindow / 1000).toFixed(1)}s</p>
      </div>

      {/* The shrinking progress bar that visually represents time left */}
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

      {/* The note buttons that the user can click or tap (mirroring keyboard input) */}
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
