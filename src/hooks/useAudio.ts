import * as Tone from "tone";
import { useCallback, useEffect, useRef } from "react";
import { NOTES } from "../constants";

export function useAudio() {
  // Refs for different synthesizers used in the app
  const synthRef = useRef<Tone.Synth>();
  const correctSynthRef = useRef<Tone.Synth>();
  const wrongSynthRef = useRef<Tone.Synth>();
  const speakingRef = useRef(false); // To track if a speech operation is ongoing

  // Initialize the "main" synthesizer with futuristic settings
  if (!synthRef.current) {
    // Filter modulation for dynamic texture
    const filter = new Tone.Filter({
      type: "lowpass",
      frequency: 800, // Starting cutoff frequency
      resonance: 5, // Adds sharpness to the filter
    }).toDestination();

    // Delay for spatial rhythmic effect
    const delay = new Tone.FeedbackDelay({
      delayTime: "16n", // Tempo-synced delay
      feedback: 0.4, // Subtle rhythmic repeats
      wet: 0.5, // Moderate presence
    }).connect(filter);

    // Reverb for atmospheric depth
    const reverb = new Tone.Reverb({
      decay: 2.5, // Long decay for spacey feel
      wet: 0.3, // Blended presence
    }).connect(delay);

    // Goa/Psytrance synth setup
    synthRef.current = new Tone.Synth({
      oscillator: {
        type: "sawtooth", // Bright and edgy sound
      },
      envelope: {
        attack: 0.005, // Quick snappy attack
        decay: 0.3, // Moderate decay for plucky feel
        sustain: 0.1, // Keeps some presence
        release: 0.2, // Short release for rhythmic clarity
      },
    }).connect(reverb);
    synthRef.current = new Tone.Synth({
      oscillator: {
        type: "sawtooth", // Goa/Psytrance tone
      },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.1,
        release: 0.2,
      },
    }).connect(reverb);

    console.log("key sound initialized.");
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
    synthRef.current?.triggerAttackRelease(frequency, "16n"); // Play the note for an eighth note duration
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
