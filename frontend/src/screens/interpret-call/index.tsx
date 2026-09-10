/**
 * ③ 通訳呼び出し画面（看護師・タブレット 1024×768）
 *
 * 見た目は Claude Design モックアップ実物
 * （scratchpad/nurselink/Interpreter.dc.html）のマークアップをそのまま移植している。
 * 配色hex・余白・フォントサイズ・レイアウト構造を変更する場合は必ずモックアップ側と
 * 突き合わせること（AGENTS.md 7章）。
 *
 * 動作ロジック（画面デザインとは独立。作り替え時も維持すること）:
 * - sessionStorage の nurselink.questionnaireId があれば GET /questionnaire/{id} を参照し、
 *   patientLanguage を通訳言語の初期選択値として使う（取得できない場合は英語をデフォルト）。
 * - 「通訳を開始する」で nurselink.interpretSessionId / nurselink.interpretLanguage を
 *   保存し、④診察通訳画面（/interpret/session）へ遷移する。
 * - ②で確定済みの問診サマリーは nurselink.questionnaireId 経由でそのまま④に引き継がれる
 *   （引き継ぎ処理自体は④側の担当範囲。ここでは状態の提示のみ）。
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/api/client";
import type { Questionnaire } from "@/types/questionnaire";
import { Yui } from "@/components/character/Yui";
import "./styles.css";

const QUESTIONNAIRE_ID_KEY = "nurselink.questionnaireId";
const INTERPRET_SESSION_ID_KEY = "nurselink.interpretSessionId";
const INTERPRET_LANGUAGE_KEY = "nurselink.interpretLanguage";

interface LanguageOption {
  code: string; // BCP47言語コード（primary subtag）
  label: string; // 現地語表記
  labelJa: string; // 日本語表記
}

/**
 * 通訳は「日本語 ⇄ 選択した言語」の固定ペアなので、日本語は選択肢に含めない。
 * 並び順・表記はモックアップの3×2グリッドに一致させている。
 */
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", labelJa: "英語" },
  { code: "zh", label: "中文", labelJa: "中国語（簡体）" },
  { code: "vi", label: "Tiếng Việt", labelJa: "ベトナム語" },
  { code: "ko", label: "한국어", labelJa: "韓国語" },
  { code: "pt", label: "Português", labelJa: "ポルトガル語" }
];

const DEFAULT_LANGUAGE_CODE = SUPPORTED_LANGUAGES[0].code; // 情報が無い場合は英語

function resolveDefaultLanguage(patientLanguage?: string): string {
  if (!patientLanguage) return DEFAULT_LANGUAGE_CODE;
  const primary = patientLanguage.split("-")[0].toLowerCase();
  const matched = SUPPORTED_LANGUAGES.find((lang) => lang.code === primary);
  return matched ? matched.code : DEFAULT_LANGUAGE_CODE;
}

type LoadStatus = "idle" | "loading" | "loaded" | "error";
type AudioOutput = "speaker" | "earphone";
type CaptionSize = "sm" | "md" | "lg";

/** ISO8601 を「10:24」表記にする。不正値は表示しない。 */
function formatClock(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** 患者行のサブテキスト（例: 頭痛 ／ 受付 10:24 ／ 確定 10:33）を組み立てる。 */
function buildPatientMeta(questionnaire: Questionnaire | null): string | null {
  if (!questionnaire) return null;
  const parts: string[] = [];
  const chiefComplaint = questionnaire.symptoms[0];
  if (chiefComplaint) parts.push(chiefComplaint.descriptionJa || chiefComplaint.category);
  const receivedAt = formatClock(questionnaire.createdAt);
  if (receivedAt) parts.push(`受付 ${receivedAt}`);
  const confirmedAt = formatClock(questionnaire.confirmedAt);
  if (confirmedAt) parts.push(`確定 ${confirmedAt}`);
  return parts.length > 0 ? parts.join(" ／ ") : null;
}

export default function InterpretCallScreen() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANGUAGE_CODE);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [hasLinkedQuestionnaire, setHasLinkedQuestionnaire] = useState(false);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  // 音声出力先・字幕サイズはこの画面内の表示設定。既定値はモックアップに合わせる。
  const [audioOutput, setAudioOutput] = useState<AudioOutput>("speaker");
  const [captionSize, setCaptionSize] = useState<CaptionSize>("lg");

  useEffect(() => {
    const questionnaireId = sessionStorage.getItem(QUESTIONNAIRE_ID_KEY);
    if (!questionnaireId) return;

    setHasLinkedQuestionnaire(true);
    setLoadStatus("loading");
    let cancelled = false;

    api
      .get<Questionnaire>(`/questionnaire/${questionnaireId}`)
      .then((data) => {
        if (cancelled) return;
        setQuestionnaire(data);
        setSelectedLanguage(resolveDefaultLanguage(data.patientLanguage));
        setLoadStatus("loaded");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 補助情報の取得失敗に過ぎないため画面はブロックしない。看護師にはバッジで伝え、
        // 通訳言語は手動選択に委ねる（AGENTS.md 5章：無言で失敗させない）。
        console.error("問診票の取得に失敗しました:", err instanceof ApiError ? err.message : err);
        setLoadStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleStart() {
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(INTERPRET_SESSION_ID_KEY, sessionId);
    sessionStorage.setItem(INTERPRET_LANGUAGE_KEY, selectedLanguage);
    navigate("/interpret/session");
  }

  const patientMeta = buildPatientMeta(questionnaire);
  const patientId = questionnaire?.patientDisplayId ?? (hasLinkedQuestionnaire ? "—" : "未連携");
  // 問診サマリーの引き継ぎ可否は questionnaireId の有無で決まる（看護師が切り替える設定ではない）
  const handoverActive = hasLinkedQuestionnaire;

  return (
    <div className="interpret-call">
      <header className="interpret-call__header">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.4 19.4 6v5.8c0 4.3-3.1 7.3-7.4 8.5-4.3-1.2-7.4-4.2-7.4-8.5V6z"
            fill="#0E9E92"
          />
          <path
            d="M7.7 12.2h2.1l1.3-2.7 1.7 4.9 1.3-2.2h2.3"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="interpret-call__brand">NurseLink AI</span>
        <span className="interpret-call__rule" aria-hidden="true" />
        <span className="interpret-call__header-title">通訳呼び出し</span>
        <div className="interpret-call__header-meta">
          <span>処置室 3</span>
          <span className="interpret-call__rule interpret-call__rule--sm" aria-hidden="true" />
          <span>看護師端末</span>
        </div>
      </header>

      <div className="interpret-call__body">
        {/* 左：キャラクター＋起動 */}
        <section className="interpret-call__left">
          <div className="interpret-call__stage">
            <Yui expression="greeting" size={190} />
          </div>

          <div className="interpret-call__headline">
            <h1 className="interpret-call__headline-title">ユイを通訳として呼び出す</h1>
            <p className="interpret-call__headline-sub">
              問診で患者さんが話した相手と同じキャラクターが、
              <br />
              そのまま診察の通訳に入ります。
            </p>
          </div>

          <div className="interpret-call__cta">
            <button type="button" className="interpret-call__start" onClick={handleStart}>
              <svg
                width="24"
                height="24"
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
              <span className="interpret-call__start-label">通訳を開始する</span>
            </button>
            <p className="interpret-call__note">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9BB0B3"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 11v5.4" />
                <circle cx="12" cy="7.8" r="1" fill="#9BB0B3" stroke="none" />
              </svg>
              マイクは開始ボタンを押したときだけ有効になります
            </p>
          </div>
        </section>

        {/* 右：設定 */}
        <div className="interpret-call__right">
          <section className="interpret-call__card interpret-call__card--patient">
            <div className="interpret-call__card-head">
              <h2 className="interpret-call__card-title">対象の患者</h2>
              <PatientStatusPill
                hasLinkedQuestionnaire={hasLinkedQuestionnaire}
                loadStatus={loadStatus}
              />
            </div>
            <div
              className={`interpret-call__patient${handoverActive ? "" : " interpret-call__patient--empty"}`}
              aria-live="polite"
            >
              <div className="interpret-call__patient-main">
                <span className="interpret-call__patient-id">{patientId}</span>
                <span className="interpret-call__patient-meta">
                  {patientMeta ??
                    (hasLinkedQuestionnaire
                      ? loadStatus === "error"
                        ? "問診票の詳細を取得できませんでした"
                        : "問診票の情報を確認しています…"
                      : "引き継ぐ問診票がありません。通訳のみを単体で起動します")}
                </span>
              </div>
              <div className="interpret-call__handover">
                <span className="interpret-call__handover-label">問診サマリーを引き継ぐ</span>
                <span
                  className={`interpret-call__switch${handoverActive ? "" : " interpret-call__switch--off"}`}
                  role="img"
                  aria-label={
                    handoverActive
                      ? "問診サマリーを引き継ぎます"
                      : "引き継ぐ問診サマリーはありません"
                  }
                >
                  <span className="interpret-call__switch-knob" />
                </span>
              </div>
            </div>
          </section>

          <section className="interpret-call__card interpret-call__card--language">
            <div className="interpret-call__lang-head">
              <h2 className="interpret-call__card-title">通訳する言語</h2>
              <span className="interpret-call__lang-hint">日本語 ⇄ 選択した言語</span>
              <span className="interpret-call__lang-auto">
                {loadStatus === "loaded" ? "問診時の言語を自動選択" : "手動で選択してください"}
              </span>
            </div>
            <div
              className="interpret-call__lang-grid"
              role="radiogroup"
              aria-label="通訳する言語"
            >
              {SUPPORTED_LANGUAGES.map((lang) => {
                const selected = lang.code === selectedLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`interpret-call__lang${selected ? " is-selected" : ""}`}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <span className="interpret-call__lang-name">{lang.label}</span>
                    <span className="interpret-call__lang-ja">{lang.labelJa}</span>
                  </button>
                );
              })}
              {/* MVPの対応言語は5種。8言語への拡張UIは未実装のため無効表示にしている。 */}
              <button
                type="button"
                className="interpret-call__lang interpret-call__lang--more"
                disabled
              >
                <span className="interpret-call__lang-name">その他の言語</span>
                <span className="interpret-call__lang-ja">8言語から選択</span>
              </button>
            </div>
          </section>

          <section className="interpret-call__card interpret-call__card--output">
            <div className="interpret-call__field">
              <h2 className="interpret-call__card-title">音声の出力先</h2>
              <div className="interpret-call__seg" role="radiogroup" aria-label="音声の出力先">
                <button
                  type="button"
                  role="radio"
                  aria-checked={audioOutput === "speaker"}
                  className={`interpret-call__seg-btn${audioOutput === "speaker" ? " is-active" : ""}`}
                  onClick={() => setAudioOutput("speaker")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 9.4h3.2L12.6 6v12L8.2 14.6H5z" />
                    <path d="M16.3 9.6a3.6 3.6 0 0 1 0 4.8" />
                  </svg>
                  端末スピーカー
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={audioOutput === "earphone"}
                  className={`interpret-call__seg-btn${audioOutput === "earphone" ? " is-active" : ""}`}
                  onClick={() => setAudioOutput("earphone")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 15v-3a7 7 0 0 1 14 0v3" />
                    <rect x="3.2" y="14" width="4.2" height="6.2" rx="2.1" />
                    <rect x="16.6" y="14" width="4.2" height="6.2" rx="2.1" />
                  </svg>
                  イヤホン
                </button>
              </div>
            </div>

            <span className="interpret-call__vrule" aria-hidden="true" />

            <div className="interpret-call__field">
              <h2 className="interpret-call__card-title">字幕サイズ</h2>
              <div className="interpret-call__seg" role="radiogroup" aria-label="字幕サイズ">
                {(
                  [
                    { value: "sm", label: "小" },
                    { value: "md", label: "中" },
                    { value: "lg", label: "大" }
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={captionSize === option.value}
                    className={`interpret-call__seg-btn interpret-call__seg-btn--size interpret-call__seg-btn--${option.value}${
                      captionSize === option.value ? " is-active" : ""
                    }`}
                    onClick={() => setCaptionSize(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="interpret-call__recent">
              <span className="interpret-call__recent-label">直近の通訳</span>
              <span className="interpret-call__recent-value">記録なし</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface PatientStatusPillProps {
  hasLinkedQuestionnaire: boolean;
  loadStatus: LoadStatus;
}

/** 「②で確定済み」バッジ。問診票が無い/取得できない場合はその状態を出す。 */
function PatientStatusPill({ hasLinkedQuestionnaire, loadStatus }: PatientStatusPillProps) {
  if (!hasLinkedQuestionnaire) {
    return <span className="interpret-call__pill interpret-call__pill--muted">問診票なし</span>;
  }
  if (loadStatus === "error") {
    return <span className="interpret-call__pill interpret-call__pill--warning">取得に失敗</span>;
  }
  if (loadStatus === "loaded") {
    return <span className="interpret-call__pill">②で確定済み</span>;
  }
  return <span className="interpret-call__pill interpret-call__pill--muted">読み込み中</span>;
}
