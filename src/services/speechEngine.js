// Speech Engine Service for NurseLink AI
// Handles Web Speech Synthesis (TTS) and Web Speech Recognition (STT) with audio simulation

class SpeechEngineService {
  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.onStateChange = null;
    this.onResult = null;
    this.setupRecognition();
  }

  setupRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChange) this.onStateChange({ isListening: true });
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChange) this.onStateChange({ isListening: false });
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onResult) {
          this.onResult({
            transcript,
            isFinal: event.results[event.results.length - 1].isFinal
          });
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        this.isListening = false;
        if (this.onStateChange) this.onStateChange({ isListening: false, error: err.error });
      };
    }
  }

  speak(text, langCode = 'ja-JP', onStart, onEnd) {
    if (!this.synthesis) {
      // Simulation fallback if TTS not available
      if (onStart) onStart();
      const delay = Math.min(Math.max(text.length * 50, 1500), 4000);
      setTimeout(() => {
        if (onEnd) onEnd();
      }, delay);
      return;
    }

    this.synthesis.cancel(); // Stop current speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Friendly warm tone

    // Try to pick a female voice matching language if available
    const voices = this.synthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)) && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Kyoko') || v.name.includes('Otoya')));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
      if (this.onStateChange) this.onStateChange({ isSpeaking: true });
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      if (this.onStateChange) this.onStateChange({ isSpeaking: false });
    };

    utterance.onerror = (err) => {
      console.warn('TTS error:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  startListening(langCode = 'en-US', onResult, onStateChange) {
    this.onResult = onResult;
    this.onStateChange = onStateChange;

    if (this.recognition) {
      try {
        this.recognition.lang = langCode;
        this.recognition.start();
        return true;
      } catch (err) {
        console.warn('Could not start real recognition, falling back to simulated input', err);
      }
    }
    return false;
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
    }
    this.isListening = false;
  }
}

export const speechEngine = new SpeechEngineService();
