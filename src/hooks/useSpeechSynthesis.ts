import { useEffect, useState } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find Dutch male voice (nl-NL)
    const dutchMaleVoice = voices.find(
      (voice) => 
        voice.lang.startsWith("nl") && 
        (voice.name.toLowerCase().includes("male") || 
         voice.name.toLowerCase().includes("man") ||
         !voice.name.toLowerCase().includes("female"))
    );
    
    const dutchVoice = voices.find((voice) => voice.lang.startsWith("nl"));

    if (dutchMaleVoice) {
      utterance.voice = dutchMaleVoice;
    } else if (dutchVoice) {
      utterance.voice = dutchVoice;
    }

    utterance.lang = "nl-NL";
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 0.8; // Lower pitch for male voice

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};
