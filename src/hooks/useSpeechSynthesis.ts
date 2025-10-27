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

    // Split text into sentences for more natural intonation
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentIndex = 0;

    const speakSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsSpeaking(false);
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[currentIndex].trim());
      
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
      utterance.rate = 0.95; // Natural speaking pace
      utterance.pitch = 0.85; // Comfortable male pitch
      utterance.volume = 1.0; // Full volume

      if (currentIndex === 0) {
        utterance.onstart = () => setIsSpeaking(true);
      }

      utterance.onend = () => {
        currentIndex++;
        // Small pause between sentences for natural flow
        setTimeout(speakSentence, 200);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakSentence();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};
