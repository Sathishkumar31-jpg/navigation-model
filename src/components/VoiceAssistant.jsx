import { triggerVibration } from './HapticFeedback';

export const speak = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

import { useEffect } from 'react';

const VoiceAssistant = ({ onCommand }) => {
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      
      console.log("Heard:", command);

      if (command.includes("start navigation")) onCommand("START");
      else if (command.includes("stop navigation")) onCommand("STOP");
      else if (command.includes("where am i")) onCommand("STATUS");
      else if (command.includes("repeat instructions")) onCommand("REPEAT");
    };

    recognition.onerror = (e) => console.log("Speech error:", e.error);
    
    recognition.onend = () => {
      // Loop
      try { recognition.start(); } catch(e){}
    };

    try {
      recognition.start();
    } catch(e){}

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  }, [onCommand]);

  return null;
};

export default VoiceAssistant;

