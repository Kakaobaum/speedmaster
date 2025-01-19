import React, { useEffect, useState } from "react";
import { Music, ArrowLeft } from "lucide-react"; // Icons for visual elements
import { NOTES } from "../constants"; // Notes used in the tutorial
import { useAudio } from "../hooks/useAudio"; // Hook for audio functionalities

interface TutorialProps {
  onComplete: () => void; // Function called when tutorial is complete
  onExit: () => void; // Function called to exit the tutorial
}

export function Tutorial({ onComplete, onExit }: TutorialProps) {
  const { speak, playNote, playCorrect } = useAudio(); // Access audio functions
  const [currentKey, setCurrentKey] = useState<string | null>(null); // Current note key being taught
  const [step, setStep] = useState(0); // Current tutorial step
  const [isAnimating, setIsAnimating] = useState(false); // Animation state
  const [waitingForInput, setWaitingForInput] = useState(false); // Input expectation state

  const handleNotePress = (key: string) => {
    if (step === 0) {
      setStep(1); // Start tutorial when any key is pressed
      return;
    }

    if (step === Object.keys(NOTES).length + 1) {
      onComplete(); // Complete tutorial at the end
      return;
    }

    if (waitingForInput && currentKey === key) {
      // Correct note was pressed
      playCorrect(); // Play success sound
      speak("Correct! Well done!"); // Congratulate the user
      setIsAnimating(true);
      setWaitingForInput(false);

      setTimeout(() => {
        setIsAnimating(false);
        setStep((prev) => prev + 1); // Move to next tutorial step
      }, 1500);
    }
  };

  useEffect(() => {
    // Define tutorial steps
 const steps = [
  {
    message: "Welcome to the SpeedMaster tutorial! Tap anywhere to begin.",
    action: null,
  },
  ...Object.entries(NOTES).map(([key, note]) => ({
    message: `This is the ${note.name} note.`,
    action: () => {
      setTimeout(() => {
        // Wait 1000ms before playing the note
        playNote(key); // Play the note
        setTimeout(() => {
          // Wait 1000ms after playing the note before speaking
          speak(`When you hear this sound, tap the ${key} button.`);
        }, 1000); // 1000ms delay after playNote
      }, 1000); // 1000ms delay before playNote
      return key; // Set the expected key for this step
    },
  })),
];
      {
        message:
          "Excellent! During the game, you'll need to tap the correct key when you hear each note. Tap spacebar to start playing or escape to return to the menu.",
        action: null,
      },
    ];

    const currentStep = steps[step];
    if (currentStep) {
      speak(currentStep.message); // Announce step instructions
      if (currentStep.action) {
        const key = currentStep.action(); // Perform step-specific action
        setCurrentKey(key);
        setWaitingForInput(true);
      } else {
        setCurrentKey(null);
        setWaitingForInput(false);
      }
    } else {
      onComplete(); // End tutorial if no steps are left
    }
  }, [step, speak, playNote, onComplete]);

  useEffect(() => {
    // Handle keyboard input for notes
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      handleNotePress(key);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress); // Cleanup listener
  }, [step, currentKey, waitingForInput, onComplete, onExit]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <button
        onClick={onExit}
        className="absolute top-4 sm:top-8 left-4 sm:left-8 text-white flex items-center gap-2 hover:text-gray-300 active:scale-95 transition-transform"
        aria-label="Back to Menu"
      >
        <ArrowLeft /> Back to Menu {/* Exit tutorial button */}
      </button>

      {/* Tutorial logo and header */}
      <Music className="w-12 h-12 sm:w-16 sm:h-16 text-white mb-8 animate-pulse" />
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 sm:mb-12">
        Tutorial
      </h2>

      {/* Buttons representing notes */}
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
