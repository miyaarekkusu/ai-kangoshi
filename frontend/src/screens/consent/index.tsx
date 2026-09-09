import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Yui } from "@/components/character/Yui";
import { api } from "@/api/client";
import { COPY, LANGUAGES, type ConsentPoint, type LanguageCode } from "./copy";
import "./consent.css";

/**
 * ⓪ 同意画面（患者）
 * - 見た目は Claude Design モックアップ scratchpad/nurselink/Consent.dc.html（390×844）を
 *   そのまま移植したもの。配色・余白・文字サイズ・アイコンは同ファイル準拠。
 * - AI看護師ユイが選択言語で自己紹介し、音声録音・送信・問診票作成への利用について
 *   明示的な同意を取得する（README「主な機能」0番、AGENTS.md 6章）。
 * - 同意チェックを入れない限り送信できず、同意しない限り /intake には進めない。
 * - 同意時: 匿名の受付番号を発行し、sessionStorage に他画面契約のキー名で保存したうえで
 *   バックエンドに同意記録を送信してから遷移する。
 */

type SubmitStatus = "idle" | "submitting" | "error";

function generatePatientDisplayId(): string {
  const digits = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `A-${digits}`;
}

/** ヘッダーのブランドロゴ（モックアップ 22-23行目のSVG） */
function BrandMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.4 19.4 6v5.8c0 4.3-3.1 7.3-7.4 8.5-4.3-1.2-7.4-4.2-7.4-8.5V6z" fill="#0E9E92" />
      <path
        d="M7.7 12.2h2.1l1.3-2.7 1.7 4.9 1.3-2.2h2.3"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ヘッダー右の現在言語バッジに使う地球アイコン */
function GlobeIcon({ size = 16, stroke = "#4E7076" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5z" />
    </svg>
  );
}

/** 同意カードの3項目アイコン（モックアップ 79/89/99行目のSVG） */
function PointIcon({ id }: { id: ConsentPoint["id"] }) {
  if (id === "recording") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0B7C73"
        strokeWidth="1.9"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3z" />
        <path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0" />
        <path d="M12 18v2.6" />
      </svg>
    );
  }

  if (id === "anonymous") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0B7C73"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3.6l7 2.6v5.5c0 4.2-2.9 7-7 8.1-4.1-1.1-7-3.9-7-8.1V6.2z" />
        <path d="M9.1 12.1l2.1 2.1 4.1-4.4" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9532F"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="8" r="3.3" />
      <path d="M4.2 19.4c0-3.3 2.7-5.4 5.8-5.4 1.1 0 2.1.2 3 .6" />
      <path d="M14.6 17.7l1.9 1.9 3.5-4" />
    </svg>
  );
}

export default function ConsentScreen() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [agreed, setAgreed] = useState(false);
  const [declined, setDeclined] = useState(false);

  const copy = COPY[language];
  const submitting = status === "submitting";
  const currentLanguageLabel = LANGUAGES.find((lang) => lang.code === language)?.nativeLabel ?? language;

  function handleSelectLanguage(code: LanguageCode) {
    setLanguage(code);
    setDeclined(false);
    setStatus("idle");
  }

  function handleToggleAgreed() {
    setAgreed((prev) => !prev);
    setDeclined(false);
    if (status === "error") setStatus("idle");
  }

  async function handleAgree() {
    if (!agreed || submitting) return;

    setDeclined(false);
    setStatus("submitting");

    const patientDisplayId = generatePatientDisplayId();

    try {
      await api.post("/consent", { patientDisplayId, language });
      sessionStorage.setItem("nurselink.patientDisplayId", patientDisplayId);
      sessionStorage.setItem("nurselink.language", language);
      navigate("/intake");
    } catch {
      setStatus("error");
    }
  }

  function handleDisagree() {
    setStatus("idle");
    setAgreed(false);
    setDeclined(true);
  }

  return (
    <div className="consent-screen">
      <header className="consent-header">
        <div className="consent-brand">
          <BrandMark />
          <span className="consent-brand__name">NurseLink AI</span>
        </div>
        <div className="consent-current-lang" aria-hidden="true">
          <GlobeIcon />
          <span>{currentLanguageLabel}</span>
        </div>
      </header>

      <div className="consent-lang-row" role="group" aria-label={copy.languageLabel}>
        {LANGUAGES.map((lang) => {
          const active = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              className={"consent-lang-chip" + (active ? " is-active" : "")}
              aria-pressed={active}
              onClick={() => handleSelectLanguage(lang.code)}
            >
              {lang.nativeLabel}
            </button>
          );
        })}
      </div>

      <div className="consent-yui-row">
        <Yui expression="greeting" size={104} className="consent-yui" />
        <div className="consent-bubble" role="status">
          <p className="consent-bubble__main">{copy.greeting}</p>
          {copy.greetingSub && <p className="consent-bubble__sub">{copy.greetingSub}</p>}
        </div>
      </div>

      <section className="consent-card" aria-labelledby="consent-card-title">
        <h1 id="consent-card-title" className="consent-card__title">
          {copy.consentTitle}
        </h1>

        {copy.points.map((point) => (
          <div key={point.id} className="consent-point">
            <div className={"consent-point__icon consent-point__icon--" + point.tone}>
              <PointIcon id={point.id} />
            </div>
            <div className="consent-point__text">
              <p className="consent-point__title">{point.title}</p>
              <p className="consent-point__body">{point.body}</p>
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        role="checkbox"
        aria-checked={agreed}
        className={"consent-check" + (agreed ? " is-checked" : "")}
        onClick={handleToggleAgreed}
        disabled={submitting}
      >
        <span className="consent-check__box" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.6l4.5 4.4L19 7.4" />
          </svg>
        </span>
        <span className="consent-check__label">{copy.consentCheckLabel}</span>
      </button>

      <div className="consent-footer">
        {status === "error" && (
          <p className="consent-error" role="alert">
            {copy.errorMessage}
          </p>
        )}

        <button
          type="button"
          className="consent-primary-btn"
          onClick={handleAgree}
          disabled={!agreed || submitting}
        >
          <span>
            {submitting ? copy.submittingLabel : status === "error" ? copy.retryLabel : copy.agreeButton}
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4.5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>

        <button type="button" className="consent-secondary-btn" onClick={handleDisagree} disabled={submitting}>
          {copy.disagreeButton}
        </button>

        {declined ? (
          <div className="consent-note consent-note--declined" role="alert">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9532F"
              strokeWidth="1.9"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 11v5.4" />
              <circle cx="12" cy="7.8" r="1" fill="#C9532F" stroke="none" />
            </svg>
            <div>
              <p>{copy.declinedNotice}</p>
              <p>{copy.reconsiderHint}</p>
            </div>
          </div>
        ) : (
          <div className="consent-note">
            <svg
              width="15"
              height="15"
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
            <p>{copy.footnote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
