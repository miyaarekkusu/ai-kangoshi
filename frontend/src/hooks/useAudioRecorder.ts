import { useCallback, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "processing" | "error";

interface UseAudioRecorderResult {
  status: RecorderStatus;
  /** マイク権限が拒否された場合など、録音を開始・完了できなかった場合にtrue */
  hasError: boolean;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  reset: () => void;
}

/**
 * ブラウザのMediaRecorder APIを使った音声録音の共通フック。
 * ①問診対話画面・④診察通訳画面で共用する。
 *
 * AGENTS.md 5章：マイク権限は必ずユーザー操作（このstart()の呼び出し元のクリックハンドラ）
 * を起点にのみ要求すること。ページロード時や自動での呼び出しはしない。
 * エラーメッセージは呼び出し側（各画面のcopy）で多言語化して表示する。
 */
export function useAudioRecorder(): UseAudioRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [hasError, setHasError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setHasError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferredType = ["audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
    } catch (err) {
      console.error("[useAudioRecorder] getUserMedia failed", err);
      setHasError(true);
      setStatus("error");
    }
  }, []);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      setStatus("processing");
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setStatus("idle");
        resolve(blob.size > 0 ? blob : null);
      };
      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setHasError(false);
  }, []);

  return { status, hasError, start, stop, reset };
}
