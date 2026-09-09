import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Yui } from "@/components/character/Yui";
import { api, wsUrl } from "@/api/client";
import type { Questionnaire } from "@/types/questionnaire";
import "./interpret-session.css";

/**
 * ④ 診察通訳画面（医師・患者）
 *
 * 見た目は Claude Design モックアップ実ソース
 * （scratchpad/nurselink/Consultation.dc.html, 1440x900）をそのまま移植したもの
 * （interpret-session.css参照）。会話パネルは暗い面（診察室で離れた位置から
 * 医師・患者双方が読む前提）。
 *
 * 動作ロジック（従来実装のまま維持）:
 * - ③からの sessionStorage 引き継ぎ（無ければ③へリダイレクト）
 * - GET /questionnaire/{id} による問診サマリー取得
 * - wsUrl 経由のWebSocket接続・自動再接続（指数バックオフ）
 * - 発話ブロック単位（疑似リアルタイム）での送受信、最新発話の強調表示
 *
 * STT/TTSは未実装（AGENTS.md 2章のPhase区分・5章のマイク権限要件に従い、
 * 実装時はユーザー操作起点でのみ getUserMedia を呼ぶこと）。
 */

type Speaker = "doctor" | "patient";
type ConnectionStatus = "connecting" | "connected" | "disconnected";
type QuestionnaireLoadStatus = "idle" | "loading" | "loaded" | "error";

interface InterpretMessage {
  id: string;
  speaker: Speaker;
  textOriginal: string;
  textTranslated: string;
}

const SPEAKER_LABEL: Record<Speaker, string> = {
  doctor: "医師 · 日本語",
  patient: "患者"
};

const DOCTOR_PHRASES = ["もう一度お願いします", "上を向いてください", "検査を行います", "痛みはありますか"];

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function InterpretSessionScreen() {
  const navigate = useNavigate();

  const [sessionId] = useState(() => sessionStorage.getItem("nurselink.interpretSessionId"));
  const [interpretLanguage] = useState(() => sessionStorage.getItem("nurselink.interpretLanguage"));
  const [questionnaireId] = useState(() => sessionStorage.getItem("nurselink.questionnaireId"));

  useEffect(() => {
    if (!sessionId || !interpretLanguage) {
      navigate("/interpret/call", { replace: true });
    }
  }, [sessionId, interpretLanguage, navigate]);

  // --- 経過時間（実際のセッション開始からの経過秒数） ---
  const sessionStartRef = useRef(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 問診サマリー ---
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questionnaireStatus, setQuestionnaireStatus] = useState<QuestionnaireLoadStatus>("idle");
  const [questionnaireReloadKey, setQuestionnaireReloadKey] = useState(0);

  useEffect(() => {
    if (!questionnaireId) {
      setQuestionnaireStatus("idle");
      return;
    }
    let cancelled = false;
    setQuestionnaireStatus("loading");
    api
      .get<Questionnaire>(`/questionnaire/${questionnaireId}`)
      .then((data) => {
        if (cancelled) return;
        setQuestionnaire(data);
        setQuestionnaireStatus("loaded");
      })
      .catch(() => {
        if (cancelled) return;
        setQuestionnaireStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [questionnaireId, questionnaireReloadKey]);

  // --- WebSocket通訳チャンネル ---
  const [messages, setMessages] = useState<InterpretMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const forceReconnectRef = useRef<() => void>(() => {});
  const bubbleListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    let disposed = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      setConnectionStatus("connecting");
      const socket = new WebSocket(
        wsUrl(`/ws/interpret/${sessionId}?lang=${encodeURIComponent(interpretLanguage ?? "en")}`)
      );
      wsRef.current = socket;

      socket.onopen = () => {
        if (disposed) return;
        attempt = 0;
        setReconnectAttempt(0);
        setConnectionStatus("connected");
      };

      socket.onmessage = (event) => {
        if (disposed) return;
        try {
          const data = JSON.parse(event.data) as {
            speaker?: string;
            textOriginal?: string;
            textTranslated?: string;
          };
          if (data.speaker !== "doctor" && data.speaker !== "patient") return;
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${prev.length}`,
              speaker: data.speaker as Speaker,
              textOriginal: data.textOriginal ?? "",
              // TODO(担当エージェント): 受信したtextTranslatedをTTSで読み上げる（未実装。字幕表示のみ）。
              textTranslated: data.textTranslated ?? ""
            }
          ]);
        } catch {
          // 不正なメッセージは無視する
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        wsRef.current = null;
        setConnectionStatus("disconnected");
        attempt += 1;
        setReconnectAttempt(attempt);
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        retryTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        // oncloseも続けて発火するため、再接続処理はoncloseに委ねる
      };
    }

    forceReconnectRef.current = () => {
      if (retryTimer) clearTimeout(retryTimer);
      connect();
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    const el = bubbleListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // --- 発話入力（STT未実装のため暫定でテキスト入力） ---
  // TODO(担当エージェント): 本番は音声入力（Whisper API経由のSTT）に置き換える。
  // マイク権限はユーザー操作起点で要求すること（AGENTS.md 5章）。
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const [draftText, setDraftText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (messages.length === 0) return;
    setIsSpeakingNow(true);
    const timer = setTimeout(() => setIsSpeakingNow(false), 1800);
    return () => clearTimeout(timer);
  }, [messages.length]);

  function handleOpenSpeaker(speaker: Speaker) {
    if (isPaused) return;
    setActiveSpeaker(speaker);
    setDraftText("");
  }

  function handleCancelInput() {
    setActiveSpeaker(null);
    setDraftText("");
  }

  function handleInsertPhrase(phrase: string) {
    if (isPaused) return;
    setActiveSpeaker("doctor");
    setDraftText(phrase);
  }

  function handleSend() {
    const text = draftText.trim();
    if (!text || !activeSpeaker) return;
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ speaker: activeSpeaker, textOriginal: text }));
    setActiveSpeaker(null);
    setDraftText("");
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleEndSession() {
    wsRef.current?.close();
    navigate("/interpret/call");
  }

  const languageLabel = useMemo(() => {
    if (!interpretLanguage) return "";
    const known: Record<string, string> = { en: "English", ja: "日本語", zh: "中文", vi: "Tiếng Việt", ko: "한국어", pt: "Português" };
    return known[interpretLanguage] ?? interpretLanguage;
  }, [interpretLanguage]);

  if (!sessionId || !interpretLanguage) {
    // ③へリダイレクトするまでの一瞬。何も表示せずナビゲーションを待つ。
    return null;
  }

  return (
    <div className="interpret-session-screen">
      <header className="interpret-header">
        <div className={`interpret-status is-${connectionStatus}`}>
          <span className="interpret-status-dot" aria-hidden="true" />
          <span className="interpret-status-label">診察通訳中</span>
        </div>
        <span className="interpret-header-divider" aria-hidden="true" />
        <div className="interpret-header-ids">
          <span className="interpret-patient-id">{questionnaire?.patientDisplayId ?? "未連携"}</span>
          <span className="interpret-chip">日本語 ⇄ {languageLabel}</span>
          {questionnaireId && <span className="interpret-chip interpret-chip-teal">問診サマリー引き継ぎ済み</span>}
        </div>
        <div className="interpret-header-actions">
          <span className="interpret-elapsed">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C9498" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.4V12l3.1 1.9" />
            </svg>
            経過 {formatElapsed(elapsedSeconds)}
          </span>
          <button type="button" className="interpret-ghost-button" onClick={() => setIsPaused((v) => !v)}>
            {isPaused ? "再開" : "一時停止"}
          </button>
          <button type="button" className="interpret-end-button" onClick={handleEndSession}>
            通訳を終了
          </button>
        </div>
      </header>

      <div className="interpret-main">
        <div className="interpret-conversation-column">
          {connectionStatus === "disconnected" && (
            <div className="interpret-banner" role="alert">
              <p>接続が切れました。自動的に再接続しています（{reconnectAttempt}回目）…</p>
              <button type="button" className="interpret-banner-button" onClick={() => forceReconnectRef.current()}>
                今すぐ再接続
              </button>
            </div>
          )}

          <section className="interpret-conversation" aria-label="通訳会話パネル">
            <div className="interpret-yui-row">
              <Yui expression={isSpeakingNow ? "speaking" : activeSpeaker ? "listening" : "idle"} size={46} />
              <div className="interpret-yui-texts">
                <span className="interpret-yui-title">ユイが通訳しています</span>
                <span className="interpret-yui-sub">発話が一区切りついたところで翻訳・読み上げします</span>
              </div>
              <div className={`interpret-wave${connectionStatus === "connected" ? "" : " is-idle"}`} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="interpret-bubble-list" ref={bubbleListRef}>
              {messages.length === 0 ? (
                <p className="interpret-empty">
                  まだ発話がありません。下の「医師が話す」「患者が話す」から発話を送信してください。
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`interpret-bubble interpret-bubble-${message.speaker}${
                      message.id === lastMessage?.id && isSpeakingNow ? " is-speaking" : ""
                    }`}
                  >
                    <div className="interpret-bubble-head">
                      <span className="interpret-bubble-speaker">{SPEAKER_LABEL[message.speaker]}</span>
                    </div>
                    <p className="interpret-bubble-original">{message.textOriginal}</p>
                    <p className="interpret-bubble-translated">{message.textTranslated}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="interpret-controls">
            <div className="interpret-mic-row">
              <button
                type="button"
                className="interpret-mic"
                onClick={() => handleOpenSpeaker("doctor")}
                disabled={isPaused}
              >
                <span className="interpret-mic-icon">
                  <MicIcon color="#4E7076" />
                </span>
                <span className="interpret-mic-texts">
                  <span className="interpret-mic-title">医師が話す</span>
                  <span className="interpret-mic-sub">押している間だけ録音</span>
                </span>
              </button>
              <button
                type="button"
                className={`interpret-mic${activeSpeaker === "patient" ? " is-active" : ""}`}
                onClick={() => handleOpenSpeaker("patient")}
                disabled={isPaused}
              >
                <span className="interpret-mic-icon">
                  <MicIcon color={activeSpeaker === "patient" ? "#FFFFFF" : "#4E7076"} />
                </span>
                <span className="interpret-mic-texts">
                  <span className="interpret-mic-title">Patient speaks</span>
                  <span className="interpret-mic-sub">患者が話す ／ 録音中…</span>
                </span>
              </button>
            </div>

            {activeSpeaker && (
              <div className="interpret-composer">
                <label className="interpret-composer-label" htmlFor="interpret-draft-text">
                  {activeSpeaker === "doctor" ? "医師の発話（テキスト入力・暫定）" : "患者の発話（テキスト入力・暫定）"}
                </label>
                <textarea
                  id="interpret-draft-text"
                  className="interpret-textarea"
                  rows={2}
                  autoFocus
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                />
                {connectionStatus !== "connected" && (
                  <p className="interpret-blocked-note">接続中のため送信できません。接続が回復してから送信してください。</p>
                )}
                <div className="interpret-composer-actions">
                  <button
                    type="button"
                    className={`interpret-send${activeSpeaker === "patient" ? " is-accent" : ""}`}
                    onClick={handleSend}
                    disabled={!draftText.trim() || connectionStatus !== "connected"}
                  >
                    送信
                  </button>
                  <button type="button" className="interpret-cancel" onClick={handleCancelInput}>
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="interpret-phrase-row">
              <span className="interpret-phrase-label">定型文</span>
              {DOCTOR_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  className="interpret-phrase"
                  onClick={() => handleInsertPhrase(phrase)}
                  disabled={isPaused}
                >
                  {phrase}
                </button>
              ))}
              <span className="interpret-disclaimer">
                <InfoIcon />
                翻訳結果は参考情報です。診断・説明は必ず医師が行ってください。
              </span>
            </div>
          </div>
        </div>

        <aside className="interpret-summary" aria-label="問診票サマリー">
          <div className="interpret-summary-head">
            <h2 className="interpret-summary-title">問診サマリー</h2>
            {questionnaire && (
              <span className={`interpret-badge${questionnaire.status === "confirmed" ? "" : " interpret-badge-warn"}`}>
                {questionnaire.status === "confirmed" ? "看護師確定済み" : "未確定"}
              </span>
            )}
          </div>

          {!questionnaireId ? (
            <p className="interpret-summary-note">この通訳セッションには問診票が引き継がれていません。</p>
          ) : questionnaireStatus === "loading" ? (
            <p className="interpret-summary-note">読み込み中…</p>
          ) : questionnaireStatus === "error" ? (
            <div className="interpret-summary-error" role="alert">
              <p>問診サマリーの取得に失敗しました。</p>
              <button type="button" className="interpret-retry" onClick={() => setQuestionnaireReloadKey((k) => k + 1)}>
                再読み込み
              </button>
            </div>
          ) : questionnaire ? (
            <div className="interpret-fields">
              {questionnaire.symptoms.length === 0 ? (
                <p className="interpret-summary-note">登録された症状はありません。</p>
              ) : (
                questionnaire.symptoms.map((symptom, i) => (
                  <div key={`${symptom.category}-${i}`} className={`interpret-field${symptom.needsReview ? " is-review" : ""}`}>
                    <span className="interpret-field-label">{symptom.category}</span>
                    <span className="interpret-field-value">{symptom.descriptionJa}</span>
                    {symptom.descriptionOriginal && (
                      <span className="interpret-field-sub">{symptom.descriptionOriginal}</span>
                    )}
                    {symptom.severity && (
                      <div className="interpret-severity">
                        <span className="interpret-severity-value">{symptom.severity}</span>
                        <div className="interpret-meter">
                          <div
                            className="interpret-meter-fill"
                            style={{
                              width:
                                symptom.severity === "severe" ? "90%" : symptom.severity === "moderate" ? "60%" : "30%"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {symptom.needsReview && <span className="interpret-review-flag">要確認</span>}
                  </div>
                ))
              )}
              {questionnaire.freeNoteJa && (
                <div className="interpret-field">
                  <span className="interpret-field-label">自由記述</span>
                  <span className="interpret-field-value-plain">{questionnaire.freeNoteJa}</span>
                </div>
              )}
            </div>
          ) : null}

          <div className="interpret-summary-foot">
            {questionnaireId && (
              <Link to="/review" className="interpret-summary-toggle">
                <DocumentIcon />
                問診票の全文を開く
              </Link>
            )}
            <p className="interpret-privacy">
              <ShieldIcon />
              匿名の受付番号のみを表示。氏名は院内システム側で管理されます。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MicIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z" />
      <path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0" />
      <path d="M12 18v2.6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9BB0B3" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.4" />
      <circle cx="12" cy="7.8" r="1" fill="#9BB0B3" stroke="none" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4E7076" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 4.5h9a2 2 0 0 1 2 2v13l-6.5-3.4L6.5 19.5v-13a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9BB0B3" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.6l7 2.6v5.5c0 4.2-2.9 7-7 8.1-4.1-1.1-7-3.9-7-8.1V6.2z" />
      <path d="M9.1 12.1l2.1 2.1 4.1-4.4" />
    </svg>
  );
}
