/**
 * ① 問診対話画面（患者）
 * 見た目は Claude Design モックアップ実ソース
 * （scratchpad/nurselink/Main.dc.html, 390x844）をそのまま移植したもの。
 * 配色・余白・角丸・フォントサイズはモックアップのインラインCSSの値に一致させている。
 *
 * 動作ロジック（⓪からのsessionStorage受け取り / POST /intake/start・/intake/message /
 * done:true で questionnaireId を保存して /complete（患者向け完了画面）へ / エラー時の再試行）
 * は従来実装のまま維持。②問診票確認画面はスタッフアプリ（frontend-staff）側にあり、
 * このアプリからは遷移しない（問診データ自体は各やり取りのたびにバックエンド経由で
 * 保存済みのため、看護師側の受付キューには自動的に反映される）。
 * マイク入力は useAudioRecorder + /media/transcribe（Whisper API）による実音声認識に置き換え済み。
 * 質問が届くと /media/speech（TTS）で読み上げる。いずれもAPIキー未設定時は
 * バックエンドがモック応答/204を返すため、字幕表示のみのフォールバックとして動作する。
 *
 * スコープ: frontend-patient/src/screens/intake/ 配下のみ編集（AGENTS.md 0章）。
 * 質問文言・症状分類ロジックはバックエンド側の事前定義テンプレートに従う（AGENTS.md 3章）。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@shared/api/client";
import { speakText, transcribeAudio } from "@shared/api/media";
import { useAudioRecorder } from "@shared/hooks/useAudioRecorder";
import { Yui, type YuiExpression } from "@shared/components/character/Yui";
import type { IntakeTurn } from "@shared/types/questionnaire";
import { LANGUAGES, type LanguageCode } from "@shared/types/language";
import { UI_COPY, SYMPTOM_CATEGORIES, type SymptomCategoryOption } from "./copy";
import "./intake.css";

const STORAGE_KEYS = {
  patientDisplayId: "nurselink.patientDisplayId",
  language: "nurselink.language",
  questionnaireId: "nurselink.questionnaireId"
} as const;

// モックアップの進捗バーは6分割。バックエンドは総質問数を返さないため、
// 表示上の目安としてこの定数を使う（超えた場合は最大値で止める）。
const TOTAL_QUESTIONS = 6;

function resolveLanguageCode(value: string): LanguageCode {
  return (LANGUAGES.find((l) => l.code === value)?.code ?? "en") as LanguageCode;
}

// ヘッダーの言語バッジ用の短い表記（ネイティブ表記だと「やさしい にほんご」等が
// 折り返して崩れるため、幅を抑えた短縮ラベルを別途持つ）。
const LANGUAGE_BADGE: Record<LanguageCode, string> = {
  en: "EN",
  ja: "JA",
  "ja-easy": "JA+",
  zh: "中文",
  vi: "VI",
  ko: "KO",
  pt: "PT"
};

interface StartIntakeResponse {
  questionnaireId: string;
  questionId: string;
  questionOriginal: string;
  questionJa: string;
}

interface IntakeMessageResponse {
  nextQuestionId: string | null;
  nextQuestionOriginal: string | null;
  nextQuestionJa: string | null;
  done: boolean;
}

type LoadState = "loading" | "ready" | "error";

export default function IntakeScreen() {
  const navigate = useNavigate();
  const redirectingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [patientDisplayId, setPatientDisplayId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<IntakeTurn[]>([]);

  const [yuiExpression, setYuiExpression] = useState<YuiExpression>("idle");
  const recorder = useAudioRecorder();
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const languageCode = resolveLanguageCode(language ?? "en");
  const copy = UI_COPY[languageCode];

  // ⓪同意画面からのセッション情報を取得。無ければ同意画面へ戻す。
  useEffect(() => {
    const storedId = sessionStorage.getItem(STORAGE_KEYS.patientDisplayId);
    const storedLang = sessionStorage.getItem(STORAGE_KEYS.language);
    if (!storedId || !storedLang) {
      redirectingRef.current = true;
      navigate("/", { replace: true });
      return;
    }
    setPatientDisplayId(storedId);
    setLanguage(storedLang);
  }, [navigate]);

  const startIntake = useCallback(async (lang: string) => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const res = await api.post<StartIntakeResponse>(
        `/intake/start?patient_language=${encodeURIComponent(lang)}`
      );
      setQuestionnaireId(res.questionnaireId);
      setCurrentQuestionId(res.questionId);
      setTurns([
        {
          speaker: "ai",
          textOriginal: res.questionOriginal,
          textJa: lang !== "ja" ? res.questionJa : undefined
        }
      ]);
      setYuiExpression("speaking");
      setLoadState("ready");
      void speakText(res.questionOriginal);
    } catch (err) {
      console.error("intake/start failed", err);
      setLoadError(UI_COPY[resolveLanguageCode(lang)].connectionError);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (language && !redirectingRef.current) {
      void startIntake(language);
    }
  }, [language, startIntake]);

  // 録音権限が取れない等でrecorderがエラー状態になったら、その都度バナー表示する。
  useEffect(() => {
    if (recorder.status === "error") {
      setSubmitError(copy.micPermissionError);
      setYuiExpression("idle");
    }
  }, [recorder.status, copy.micPermissionError]);

  const openMicPanel = () => {
    setSubmitError(null);
    setIsInputOpen(true);
    setYuiExpression("listening");
  };

  const closeMicPanel = () => {
    setIsInputOpen(false);
    setYuiExpression("speaking");
  };

  /** マイクボタン：タップで録音開始、もう一度タップで停止→Whisper APIでテキスト化して入力欄に反映する。 */
  const handleMicToggle = useCallback(async () => {
    if (isSubmitting || recorder.status === "processing") return;

    if (recorder.status === "recording") {
      setYuiExpression("idle");
      const blob = await recorder.stop();
      if (!blob) return;
      setSubmitError(null);
      try {
        const text = await transcribeAudio(blob, language ?? undefined);
        setDraftText(text);
        setIsInputOpen(true);
        setYuiExpression("listening");
      } catch (err) {
        console.error("transcribe failed", err);
        setSubmitError(copy.connectionError);
        setYuiExpression("idle");
      }
      return;
    }

    setSubmitError(null);
    setYuiExpression("listening");
    await recorder.start();
  }, [recorder, language, isSubmitting, copy.connectionError]);

  const insertCategoryPhrase = (option: SymptomCategoryOption) => {
    // チップは常時表示なので、入力欄が閉じていればまず開いてから定型文を差し込む。
    setSubmitError(null);
    setIsInputOpen(true);
    setYuiExpression("listening");
    setSelectedCategoryId(option.id);
    const phrase = option.phrase[languageCode];
    if (phrase) {
      setDraftText((prev) => (prev ? `${prev} ${phrase}` : phrase));
    }
    textareaRef.current?.focus();
  };

  const handleSend = async () => {
    const text = draftText.trim();
    if (!text || !questionnaireId || !currentQuestionId || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setYuiExpression("listening");
    setTurns((prev) => [...prev, { speaker: "patient", textOriginal: text }]);

    try {
      const res = await api.post<IntakeMessageResponse>("/intake/message", {
        questionnaireId,
        questionId: currentQuestionId,
        patientTextOriginal: text
      });

      if (res.done || !res.nextQuestionId) {
        // 対話終了。問診データはここまでの各質問応答で既にバックエンド（Supabase）に
        // 保存済みで、看護師側の受付キュー（frontend-staff）には自動的に反映される。
        // /review はスタッフアプリ側のルートでこのアプリには存在しないため、
        // 患者向けの完了画面へ遷移する。
        sessionStorage.setItem(STORAGE_KEYS.questionnaireId, questionnaireId);
        navigate("/complete");
        return;
      }

      setDraftText("");
      setSelectedCategoryId(null);
      setIsInputOpen(false);
      setCurrentQuestionId(res.nextQuestionId);
      setTurns((prev) => [
        ...prev,
        {
          speaker: "ai",
          textOriginal: res.nextQuestionOriginal ?? "",
          textJa: language !== "ja" ? (res.nextQuestionJa ?? undefined) : undefined
        }
      ]);
      setYuiExpression("speaking");
      void speakText(res.nextQuestionOriginal ?? "");
    } catch (err) {
      console.error("intake/message failed", err);
      // 送信失敗時は患者の入力内容を保持し、再送信（再試行）できるようにする（AGENTS.md 5章）。
      setTurns((prev) => prev.slice(0, -1));
      setSubmitError(copy.connectionError);
      setYuiExpression("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patientDisplayId || !language) {
    // 同意画面へのリダイレクト待ち、またはセッション情報の読み込み前。
    return null;
  }

  if (loadState === "loading") {
    return (
      <div className="intake-screen intake-screen--center">
        <Yui expression="idle" size={164} />
        <p className="intake-status-text">{copy.preparing}</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="intake-screen intake-screen--center">
        <Yui expression="idle" size={164} />
        <div className="intake-error-card">
          <p className="intake-error-card-text">{loadError}</p>
          <button type="button" className="intake-btn intake-btn--primary" onClick={() => startIntake(language)}>
            {copy.retry}
          </button>
        </div>
      </div>
    );
  }

  const aiTurnCount = turns.filter((t) => t.speaker === "ai").length;
  const questionNumber = Math.min(Math.max(aiTurnCount, 1), TOTAL_QUESTIONS);
  const currentQuestion = [...turns].reverse().find((t) => t.speaker === "ai");
  const lastPatientTurn = [...turns].reverse().find((t) => t.speaker === "patient");

  const stageBadgeLabel = yuiExpression === "listening" ? copy.yuiListening : copy.yuiSpeaking;

  return (
    <div className="intake-screen">
      {/* ── ヘッダー：戻る / 進捗 / 言語 ── */}
      <header className="intake-topbar">
        <button
          type="button"
          className="intake-back"
          onClick={() => navigate(-1)}
          aria-label={copy.goBack}
        >
          <ChevronLeftIcon />
        </button>

        <div className="intake-progress">
          <div className="intake-progress-head">
            <span className="intake-progress-label">
              QUESTION {questionNumber} / {TOTAL_QUESTIONS}
            </span>
            <span className="intake-progress-time">{copy.approxMinutes}</span>
          </div>
          <div
            className="intake-progress-bars"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_QUESTIONS}
            aria-valuenow={questionNumber}
          >
            {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
              <span
                key={i}
                className={`intake-progress-seg${i < questionNumber ? " is-on" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="intake-lang">
          <GlobeIcon />
          <span className="intake-lang-text">{LANGUAGE_BADGE[languageCode]}</span>
        </div>
      </header>

      {/* ── キャラクター表示エリア ── */}
      <div className="intake-stage">
        <div className="intake-stage-badge">
          <span className="intake-stage-dot" />
          <span className="intake-stage-badge-text">{stageBadgeLabel}</span>
        </div>
        {/* パルスリングは Yui コンポーネント内蔵（.nl-ring 相当を重ねない） */}
        <Yui expression={yuiExpression} size={164} />
      </div>

      {/* 対話履歴は視覚上は最新のみ表示するため、支援技術向けに全文を保持する */}
      <div className="intake-sr-only" role="log" aria-live="polite">
        {turns.map((turn, idx) => (
          <p key={idx}>
            {turn.speaker === "ai" ? "Yui: " : ""}
            {turn.textOriginal}
            {turn.textJa ? ` / ${turn.textJa}` : ""}
          </p>
        ))}
      </div>

      <div className="intake-body">
        {/* ── 質問カード ── */}
        <section className="intake-question-card" aria-live="polite">
          <p className="intake-question-text">{currentQuestion?.textOriginal}</p>
          {currentQuestion?.textJa && (
            <>
              <div className="intake-question-divider" />
              <div className="intake-question-ja-row">
                <span className="intake-lang-tag">{copy.japaneseTag}</span>
                <span className="intake-question-ja">{currentQuestion.textJa}</span>
              </div>
            </>
          )}
        </section>

        {/* ── 定型文チップ ── */}
        <section className="intake-answers">
          <div className="intake-answers-head">
            <span className="intake-answers-title">{copy.orTapAnswer}</span>
            <span className="intake-answers-sub">{copy.tapAlsoWorks}</span>
          </div>
          <div className="intake-chip-row">
            {SYMPTOM_CATEGORIES.map((option) => {
              const isFreeText = option.id === "other";
              const isSelected = selectedCategoryId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`intake-chip${isFreeText ? " intake-chip--ghost" : ""}${
                    isSelected ? " is-selected" : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => insertCategoryPhrase(option)}
                  disabled={isSubmitting}
                >
                  {isFreeText ? <PencilIcon /> : <ClockIcon />}
                  {option.label[languageCode]}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {submitError && (
        <div className="intake-error-banner" role="alert">
          <span>{submitError}</span>
          <button
            type="button"
            className="intake-error-dismiss"
            onClick={() => setSubmitError(null)}
            aria-label={copy.dismiss}
          >
            ×
          </button>
        </div>
      )}

      {/* ── フッター：直前の回答＋操作 ── */}
      <div className="intake-footer">
        {!isInputOpen ? (
          <>
            {lastPatientTurn && (
              <div className="intake-sent-row">
                <div className="intake-sent-bubble">
                  <div className="intake-sent-text">「{lastPatientTurn.textOriginal}」</div>
                  <div className="intake-sent-meta">
                    {isSubmitting ? (
                      <>
                        <span className="intake-typing-dot" />
                        <span className="intake-typing-dot" />
                        <span className="intake-typing-dot" />
                        {copy.sending}
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        {copy.sentTranslated}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="intake-controls">
              <button
                type="button"
                className="intake-side-btn"
                onClick={openMicPanel}
                disabled={isSubmitting || recorder.status !== "idle"}
              >
                <ListIcon />
                <span className="intake-side-label">{copy.typeLabel}</span>
              </button>

              {/* タップで録音開始、もう一度タップで停止しWhisper API（/media/transcribe）でテキスト化する。
                  AGENTS.md 5章: マイク権限はこのonClick（ユーザー操作）を起点にのみ要求する。 */}
              <div className="intake-mic-wrap">
                {recorder.status === "recording" && <span className="intake-mic-halo" aria-hidden="true" />}
                <button
                  type="button"
                  className={`intake-mic-btn${recorder.status === "recording" ? " is-pressed" : ""}`}
                  aria-pressed={recorder.status === "recording"}
                  aria-label={copy.micAriaLabel}
                  disabled={isSubmitting || recorder.status === "processing"}
                  onClick={handleMicToggle}
                >
                  <MicIcon />
                  <span className="intake-mic-bars" aria-hidden="true">
                    {[0, 0.18, 0.36, 0.54].map((delay) => (
                      <span
                        key={delay}
                        className="intake-mic-bar"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="intake-side-btn"
                disabled
                title={copy.skipTitle}
              >
                <SkipIcon />
                <span className="intake-side-label">{copy.skipLabel}</span>
              </button>
            </div>

            <p className="intake-hint">
              {recorder.status === "recording"
                ? copy.recordingHint
                : recorder.status === "processing"
                  ? copy.transcribing
                  : copy.tapAndType}
            </p>
          </>
        ) : (
          <div className="intake-text-panel">
            <textarea
              ref={textareaRef}
              className="intake-textarea"
              rows={3}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder={copy.placeholderType}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="intake-text-actions">
              <button
                type="button"
                className="intake-btn intake-btn--ghost"
                onClick={closeMicPanel}
                disabled={isSubmitting}
              >
                {copy.back}
              </button>
              <button
                type="button"
                className="intake-btn intake-btn--primary"
                onClick={handleSend}
                disabled={isSubmitting || !draftText.trim()}
              >
                {isSubmitting ? copy.sendingEllipsis : copy.send}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── アイコン（Main.dc.html のインラインSVGをそのまま移植） ── */

function ChevronLeftIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4E7076"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 6l-6 6 6 6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4E7076" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0E9E92"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.4V12l3.1 1.9" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5D7B80"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16.2 4.6l3.2 3.2L8.6 18.6l-4.1.9.9-4.1z" />
      <path d="M14.2 6.6l3.2 3.2" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4E7076"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" />
      <circle cx="4.4" cy="6.5" r="1.3" fill="#4E7076" stroke="none" />
      <circle cx="4.4" cy="12" r="1.3" fill="#4E7076" stroke="none" />
      <circle cx="4.4" cy="17.5" r="1.3" fill="#4E7076" stroke="none" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4E7076"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 5.5l7 6.5-7 6.5z" />
      <path d="M17.5 5.5v13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7FE0D2"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.6l4.5 4.4L19 7.4" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z" />
      <path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0" />
      <path d="M12 18v2.6" />
    </svg>
  );
}
