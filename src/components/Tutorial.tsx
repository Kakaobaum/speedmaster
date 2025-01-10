import React, { useEffect, useState } from "react";
import { Music, ArrowLeft } from "lucide-react";
import { NOTES } from "../constants";
import { useAudio } from "../hooks/useAudio";

interface TutorialProps {
  onComplete: () => void;
  onExit: () => void;
}

export function Tutorial({ onComplete, onExit }: TutorialProps) {
  const { speak, playNote, playCorrect } = useAudio();
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);

  const handleNotePress = (key: string) => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === Object.keys(NOTES).length + 1) {
      onComplete();
      return;
    }

    if (waitingForInput && currentKey === key) {
      playCorrect();
      speak("Correct! Well done!");
      setIsAnimating(true);
      setWaitingForInput(false);

      setTimeout(() => {
        setIsAnimating(false);
        setStep((prev) => prev + 1);
      }, 1500);
    }
  };

  useEffect(() => {
    const steps = [
      {
        message: "Welcome to the SpeedMaster tutorial! Tap anywhere to begin.",
        action: null,
      },
      ...Object.entries(NOTES).map(([key, note]) => ({
        message: `This is the ${note.name} note. Listen carefully.`,
        action: () => {
          setTimeout(() => {
            playNote(key);
            speak(
              `When you hear this sound, tap the ${key} button. Try it now.`
            );
          }, 2000);
          return key;
        },
      })),
      {
        message:
          "Excellent! You've learned all the notes. During the game, you'll need to tap the correct button quickly when you hear each note. Tap Play to start playing or Menu to return to the menu.",
        action: null,
      },
    ];

    const currentStep = steps[step];
    if (currentStep) {
      speak(currentStep.message);
      if (currentStep.action) {
        const key = currentStep.action();
        setCurrentKey(key);
        setWaitingForInput(true);
      } else {
        setCurrentKey(null);
        setWaitingForInput(false);
      }
    } else {
      onComplete();
    }
  }, [step, speak, playNote, onComplete]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      handleNotePress(key);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [step, currentKey, waitingForInput, onComplete, onExit]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <button
        onClick={onExit}
        className="absolute top-4 sm:top-8 left-4 sm:left-8 text-white flex items-center gap-2 hover:text-gray-300 active:scale-95 transition-transform"
        aria-label="Back to Menu"
      >
        <ArrowLeft /> Back to Menu
      </button>

      <Music className="w-12 h-12 sm:w-16 sm:h-16 text-white mb-8 animate-pulse" />
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 sm:mb-12">
        Tutorial
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 w-full max-w-lg">
        {Object.entries(NOTES).map(([key, note]) => (
          <button
            key={key}
            onClick={() => handleNotePress(key)}
            className={`aspect-square rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-200 
              ${
                currentKey === key
                  ? "scale-110 ring-4 ring-white animate-pulse"
                  : ""
              }
              ${isAnimating && currentKey === key ? "animate-press" : ""}
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
            style={{
              backgroundColor: note.color,
            }}
            aria-label={`${note.name} note`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
