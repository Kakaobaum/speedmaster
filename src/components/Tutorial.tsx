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

  useEffect(() => {
    const steps = [
      {
        message:
          "Welcome to the SpeedMaster tutorial! I'll teach you how to play. Press any key when you're ready to begin.",
        action: null,
      },
      ...Object.entries(NOTES).map(([key, note]) => ({
        message: `This is the ${note.name} note.`,
        action: () => {
          setTimeout(() => {
            playNote(key);
            speak(
              `When you hear this sound, press the ${key} key. Press ${key} now to try it.`
            );
          }, 2000);
          return key;
        },
      })),
      {
        message:
          "Excellent! You've learned all the notes. During the game, you'll need to press the correct key quickly when you hear each note. Press Space to start playing or Escape to return to the menu.",
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

      // First step - any key continues
      if (step === 0) {
        setStep(1);
        return;
      }

      // Last step - space starts game, escape exits
      if (step === Object.keys(NOTES).length + 1) {
        if (key === " " || event.code === "Space") {
          onComplete();
        } else if (key === "ESCAPE") {
          onExit();
        }
        return;
      }

      // Note learning steps
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

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    step,
    currentKey,
    waitingForInput,
    onComplete,
    onExit,
    speak,
    playCorrect,
  ]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <button
        onClick={onExit}
        className="absolute top-8 left-8 text-white flex items-center gap-2 hover:text-gray-300"
        aria-label="Back to Menu, press Escape"
      >
        <ArrowLeft /> Back to Menu (Esc)
      </button>

      <Music className="w-16 h-16 text-white mb-8 animate-pulse" />
      <h2 className="text-4xl font-bold text-white mb-12">Tutorial</h2>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {Object.entries(NOTES).map(([key, note]) => (
          <div
            key={key}
            className={`w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200 
              ${
                currentKey === key
                  ? "scale-110 ring-4 ring-white animate-pulse"
                  : ""
              }
              ${isAnimating && currentKey === key ? "animate-press" : ""}`}
            style={{
              backgroundColor: note.color,
            }}
            aria-label={`${note.name} note, press ${key} key`}
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  );
}
