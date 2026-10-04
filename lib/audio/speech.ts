"use client";

export type SpeechStatus = "idle" | "loading" | "speaking" | "error";

type ActiveSpeech = {
  token: number;
  cancel: () => void;
};

let nextToken = 0;
let activeSpeech: ActiveSpeech | null = null;

function stopActiveSpeech() {
  activeSpeech?.cancel();
  activeSpeech = null;
}

export function speakMandarin(text: string, onStatus: (status: SpeechStatus) => void): () => void {
  stopActiveSpeech();

  if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    onStatus("error");
    return () => undefined;
  }

  const synthesis = window.speechSynthesis;
  const token = ++nextToken;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  let settled = false;
  let started = false;
  onStatus("loading");

  const cleanupListeners = () => {
    if (timeout) clearTimeout(timeout);
    synthesis.removeEventListener("voiceschanged", onVoicesChanged);
  };

  const settle = (status: SpeechStatus) => {
    if (settled || started || activeSpeech?.token !== token) return;
    started = true;
    settled = true;
    cleanupListeners();
    activeSpeech = null;
    onStatus(status);
  };

  const start = () => {
    if (settled || activeSpeech?.token !== token) return;

    const voices = synthesis.getVoices();
    const voice = voices.find((item) => item.lang.toLowerCase() === "zh-cn")
      ?? voices.find((item) => item.lang.toLowerCase().startsWith("zh"));
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.86;
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      if (activeSpeech?.token === token) onStatus("speaking");
    };
    utterance.onend = () => settle("idle");
    utterance.onerror = () => settle("error");

    try {
      synthesis.speak(utterance);
    } catch {
      settle("error");
    }
  };

  const onVoicesChanged = () => {
    if (synthesis.getVoices().length > 0) start();
  };

  const cancel = () => {
    if (activeSpeech?.token !== token) return;
    settled = true;
    cleanupListeners();
    try {
      synthesis.cancel();
    } finally {
      activeSpeech = null;
      onStatus("idle");
    }
  };

  activeSpeech = { token, cancel };
  if (synthesis.getVoices().length > 0) {
    start();
  } else {
    synthesis.addEventListener("voiceschanged", onVoicesChanged);
    timeout = setTimeout(start, 1500);
  }

  return cancel;
}

