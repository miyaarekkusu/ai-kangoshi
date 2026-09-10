import { ApiError } from "./client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * 音声(Blob)をバックエンド /media/transcribe に送り、テキスト化する。
 * WHISPER_API_KEY未設定時はバックエンドがモック文言を返す（呼び出し側は通常のテキストとして扱ってよい）。
 */
export async function transcribeAudio(blob: Blob, language?: string): Promise<string> {
  const form = new FormData();
  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  form.append("file", blob, `audio.${ext}`);

  const query = language ? `?language=${encodeURIComponent(language)}` : "";
  const res = await fetch(`${API_BASE_URL}/media/transcribe${query}`, {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }

  const data = (await res.json()) as { text: string };
  return data.text;
}

/**
 * テキストをバックエンド /media/speech でMP3音声に変換して再生する。
 * TTS_API_KEY未設定時は204が返るため、その場合は何もしない（字幕表示のみにフォールバック）。
 * 戻り値: 再生できた場合はtrue。
 */
export async function speakText(text: string): Promise<boolean> {
  if (!text.trim()) return false;

  const res = await fetch(`${API_BASE_URL}/media/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (res.status === 204) return false;
  if (!res.ok) {
    console.error("[speakText] TTS request failed", res.status);
    return false;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.addEventListener("ended", () => URL.revokeObjectURL(url));
  try {
    await audio.play();
    return true;
  } catch (err) {
    // ブラウザの自動再生ポリシーでブロックされた場合等。字幕表示は既に出ているので致命的ではない。
    console.warn("[speakText] audio playback blocked", err);
    URL.revokeObjectURL(url);
    return false;
  }
}
