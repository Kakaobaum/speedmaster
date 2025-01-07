import * as Tone from 'tone';
import { useCallback, useRef } from 'react';
import { NOTES } from '../constants';

export function useAudio() {
  const synthRef = useRef<Tone.Synth>();
  const correctSynthRef = useRef<Tone.Synth>();
  const wrongSynthRef = useRef<Tone.Synth>();
  const speakingRef = useRef(false);

  if (!synthRef.current) {
    synthRef.current = new Tone.Synth().toDestination();
  }
  if (!correctSynthRef.current) {
    correctSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
  }
  if (!wrongSynthRef.current) {
    wrongSynthRef.current = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
    }).toDestination();
  }

  const playNote = useCallback(async (note: string) => {
    await Tone.start();
    const frequency = NOTES[note].frequency;
    await new Promise(resolve => setTimeout(resolve, 50));
    synthRef.current?.triggerAttackRelease(frequency, "8n");
  }, []);

  const playCorrect = useCallback(async () => {
    await Tone.start();
    await new Promise(resolve => setTimeout(resolve, 50));
    correctSynthRef.current?.triggerAttackRelease("C5", "16n");
  }, []);

  const playWrong = useCallback(async () => {
    await Tone.start();
    await new Promise(resolve => setTimeout(resolve, 50));
    wrongSynthRef.current?.triggerAttackRelease("C3", "8n");
  }, []);

  const speak = useCallback((text: string) => {
    if (speakingRef.current) {
      return;
    }
    
    speakingRef.current = true;
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1.2; // Increased from 0.9 to 1.2
    speech.pitch = 1;
    speech.volume = 1;
    speech.lang = 'en-US';
    
    speech.onend = () => {
      speakingRef.current = false;
    };
    
    speech.onerror = () => {
      speakingRef.current = false;
    };
    
    window.speechSynthesis.speak(speech);
  }, []);

  return { playNote, playCorrect, playWrong, speak };
}