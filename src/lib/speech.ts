function scoreVoice(voice: SpeechSynthesisVoice): number {
  if (!voice.lang.toLowerCase().startsWith("en")) return -1;
  const name = voice.name.toLowerCase();
  let score = 0;
  if (/natural|neural/.test(name)) score += 5;
  if (/online/.test(name)) score += 1;
  if (name.includes("google")) score += 3;
  if (/premium|enhanced/.test(name)) score += 3;
  if (voice.localService) score += 1;
  // Classic low-quality legacy voices most OSes ship as the default.
  if (/david|zira|microsoft.*desktop/.test(name)) score -= 3;
  return score;
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const scored = voices
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.voice;
}

function getVoicesAsync(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const handleChange = () => {
      synth.removeEventListener("voiceschanged", handleChange);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", handleChange);
    // Some browsers never fire voiceschanged — don't hang forever.
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", handleChange);
      resolve(synth.getVoices());
    }, 500);
  });
}

export type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

export async function speakText(text: string, options: SpeakOptions = {}): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;

  synth.cancel();
  const voices = await getVoicesAsync(synth);

  // Chrome/Chromium can silently drop a speak() called in the same tick
  // right after cancel() — a well-documented engine quirk. A tiny delay
  // (and a defensive resume(), for when the engine has gone idle/paused)
  // makes this reliable across browsers.
  await new Promise((resolve) => setTimeout(resolve, 50));
  synth.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1;
  const voice = pickVoice(voices);
  if (voice) utterance.voice = voice;
  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();
  synth.speak(utterance);
}
