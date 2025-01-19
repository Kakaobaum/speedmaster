import * as Tone from "tone";
import { useCallback, useEffect, useRef } from "react";
import { NOTES } from "../constants";

export function useAudio() {
  // Refs for different synthesizers used in the app
  const synthRef = useRef<Tone.Synth>();
  const correctSynthRef = useRef<Tone.Synth>();
  const wrongSynthRef = useRef<Tone.Synth>();
  const speakingRef = useRef(false); // To track if a speech operation is ongoing

  // Initialize the "main" synthesizer with bongo-like settings
  /* -- Bongo sound --
  if (!synthRef.current) {
    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).toDestination();
    const highpass = new Tone.Filter({
      type: "highpass",
      frequency: 100,
    }).toDestination();

    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.01, // Short decay for percussive feel
      octaves: 2, // Higher pitch decay range
      oscillator: {
        type: "sine", // Smooth tone for bongos
      },
      envelope: {
        attack: 0.001, // Instant attack for a "hit"
        decay: 0.2, // Short decay
        sustain: 0, // No sustain for percussive sound
        release: 0.1, // Quick release
      },
    })
      .connect(highpass)
      .connect(reverb);

    console.log("Bongo bongo", synthRef.current);
  }
-- Bongo sound */
   // Initialize the "main" synthesizer with futuristic settings
 if (!synthRef.current) {
    // Echo effect for the railgun
    const echo = new Tone.FeedbackDelay({
      delayTime: "8n", // Rhythmic echo
      feedback: 0.4, // Controls echo strength
      wet: 0.5, // Moderate echo presence
    }).toDestination();

    // Subtle reverb for spatial depth
    const reverb = new Tone.Reverb({
      decay: 2.5, // Long reverb tail
      wet: 0.3, // Subtle application
    }).toDestination();

    // Railgun synth setup
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05, // Adds a slight drop for impact
      octaves: 1, // Minimal pitch range for clarity
      oscillator: {
        type: "sine", // Clean, low-frequency sound
      },
      envelope: {
        attack: 0.01, // Fast, punchy start
        decay: 0.2, // Short decay for a tight sound
        sustain: 0.2, // Keeps the sound slightly present
        release: 0.5, // Medium release for a lingering effect
      },
    })
      .connect(echo)
      .connect(reverb);

    console.log("Railgun synth initialized with clear, low-pitch sound.");
  }

  
  // Initialize the "correct" synthesizer with specific envelope settings
  if (!correctSynthRef.current) {
    correctSynthRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();
  }

  // Initialize the "wrong" synthesizer with different envelope settings
  if (!wrongSynthRef.current) {
    wrongSynthRef.current = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
    }).toDestination();
  }

  // Check for available English voices when the component is initialized
  useEffect(() => {
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices(); // Retrieve available voices
      if (!voices.some((voice) => voice.lang === "en-US")) {
        alert(
          "For the best experience, please install an English (US) voice in your system settings."
        );
      }
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      // Ensure voices are fully loaded before checking
      window.speechSynthesis.onvoiceschanged = checkVoices;
    } else {
      checkVoices();
    }
  }, []);

  // Play a musical note based on its frequency
  const playNote = useCallback(async (note: string) => {
    await Tone.start(); // Start the Tone.js audio context
    const frequency = NOTES[note].frequency; // Get the frequency of the note
    await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay to ensure playback
    synthRef.current?.triggerAttackRelease(frequency, "8n"); // Play the note for an eighth note duration
  }, []);

  // Play a short "correct" sound effect
  const playCorrect = useCallback(async () => {
    await Tone.start(); // Ensure Tone.js audio context is active
    await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay
    correctSynthRef.current?.triggerAttackRelease("C5", "16n"); // Play a short C5 sound
  }, []);

  // Play a "wrong" sound effect
  const playWrong = useCallback(async () => {
    await Tone.start(); // Ensure Tone.js audio context is active
    await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay
    wrongSynthRef.current?.triggerAttackRelease("C3", "8n"); // Play a short C3 sound
  }, []);

  // Speak a given text using the browser's SpeechSynthesis API
  const speak = useCallback((text: string) => {
    if (speakingRef.current) {
      return; // Prevent overlapping speech operations
    }

    speakingRef.current = true; // Mark speech as active
    window.speechSynthesis.cancel(); // Cancel any ongoing speech operations

    const speech = new SpeechSynthesisUtterance(text); // Create a speech utterance object
    speech.rate = 1.2; // Set speaking speed
    speech.pitch = 1; // Set pitch to neutral
    speech.volume = 1; // Set volume to maximum
    speech.lang = "en-US"; // Set the language to US English

    // Reset speech state when the speech operation ends
    speech.onend = () => {
      speakingRef.current = false;
    };

    // Handle speech errors
    speech.onerror = () => {
      speakingRef.current = false;
    };

    window.speechSynthesis.speak(speech); // Start speaking the text
  }, []);

  // Return all audio-related functions
  return { playNote, playCorrect, playWrong, speak };
}
