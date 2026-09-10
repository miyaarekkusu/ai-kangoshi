/**
 * ② 問診票確認画面（看護師・デスクトップ 1280×900）
 *
 * 見た目は Claude Design モックアップ実ソース
 * （scratchpad/nurselink/NurseReview.dc.html）をそのまま移植したもの。
 * 配色・余白・角丸・フォントサイズはモックアップのインラインCSSの値に一致させている
 * （frontend/src/screens/review/ReviewScreen.css・icons.tsx 参照）。
 *
 * 動作ロジック（API連携・確認/確定フロー）は従来実装のまま維持している:
 * - status === "draft" の間は「AIドラフト・看護師確認前」を明示し、
 *   確定するまで病院システム登録・紙の問診票（PDF）に反映されないことを可視化する
 *   （AGENTS.md 3章）。
 * - 確定後は編集フォームを読み取り専用にし、模擬病院システム登録完了の案内と
 *   PDF（印刷用）を開くボタンを表示する（AGENTS.md 7章／README 機能7）。
 *
 * 左の「受付キュー」は GET /questionnaire（全患者一覧）から取得し、
 * 「確認待ち／登録済み」タブは status（draft/confirmed）で実際にフィルタする。
 * 「本日の対応言語」の集計は本タスクの範囲外のため静的プレースホルダーのまま。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/api/client";
import type { Questionnaire, SymptomEntry } from "@/types/questionnaire";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  LogoIcon,
  GlobeIcon,
  AlertTriangleIcon,
  InfoCircleIcon,
  SpeakerIcon,
  TranslateIcon,
  PencilIcon,
  CheckIcon,
  ShieldCheckIcon,
  YuiAvatar
} from "./icons";
import "./ReviewScreen.css";

const QUESTIONNAIRE_ID_STORAGE_KEY = "nurselink.questionnaireId";
const DEMO_QUESTIONNAIRE_ID = "q-001";
const CONFIRMING_NURSE_ID = "nurse-demo"; // MVP段階の固定値。看護師ログインは対応外。

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const CATEGORY_LABELS: Record<string, { ja: string; en: string }> = {
  fever: { ja: "発熱", en: "Fever" },
  headache: { ja: "頭痛", en: "Headache" },
  abdominal_pain: { ja: "腹痛", en: "Abdominal pain" },
  cough: { ja: "咳", en: "Cough" },
  nausea: { ja: "吐き気", en: "Nausea" },
  general: { ja: "症状", en: "Symptom" }
};

const SEVERITY_LABELS: Record<NonNullable<SymptomEntry["severity"]>, string> = {
  mild: "軽度",
  moderate: "中等度",
  severe: "重度"
};

function categoryLabel(category: string): { ja: string; en: string } {
  return CATEGORY_LABELS[category] ?? { ja: category, en: category };
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return "この問診票はすでに確定済みのため、この操作はできません。";
    }
    return `通信エラーが発生しました（${err.status}）。ネットワーク状態を確認し、もう一度お試しください。`;
  }
  return "通信エラーが発生しました。ネットワーク状態を確認し、もう一度お試しください。";
}

/** ISO8601 を「10:24」表記にする。不正値は表示しない。 */
function formatClock(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

interface ConfirmResult {
  questionnaire: Questionnaire;
  ehrRegistered: boolean;
  pdfUrl: string;
}

export default function ReviewScreen() {
  const questionnaireId = useMemo(() => {
    try {
      return sessionStorage.getItem(QUESTIONNAIRE_ID_STORAGE_KEY) ?? DEMO_QUESTIONNAIRE_ID;
    } catch {
      return DEMO_QUESTIONNAIRE_ID;
    }
  }, []);

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 編集用のローカルコピー（日本語訳・重症度・自由記述の日本語訳のみ看護師が編集可能）
  const [editedSymptoms, setEditedSymptoms] = useState<SymptomEntry[]>([]);
  const [editedFreeNoteJa, setEditedFreeNoteJa] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [ehrRegistered, setEhrRegistered] = useState(false);

  // 受付キュー（現在の患者以外）
  const [queue, setQueue] = useState<Questionnaire[]>([]);
  const [queueTab, setQueueTab] = useState<"pending" | "confirmed">("pending");
  const [queueError, setQueueError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    try {
      const list = await api.get<Questionnaire[]>("/questionnaire");
      setQueue(list);
      setQueueError(null);
    } catch {
      setQueueError("受付キューの取得に失敗しました。");
    }
  }, []);

  const loadQuestionnaire = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.get<Questionnaire>(`/questionnaire/${questionnaireId}`);
      setQuestionnaire(data);
      setEditedSymptoms(data.symptoms.map((s) => ({ ...s })));
      setEditedFreeNoteJa(data.freeNoteJa ?? "");
      if (data.status === "confirmed") {
        setEhrRegistered(true);
      }
    } catch (err) {
      setLoadError(describeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [questionnaireId]);

  useEffect(() => {
    void loadQuestionnaire();
  }, [loadQuestionnaire]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const isConfirmed = questionnaire?.status === "confirmed";
  const isReadOnly = isConfirmed || isSaving || isConfirming;

  function updateSymptomJa(index: number, value: string) {
    setEditedSymptoms((prev) => prev.map((s, i) => (i === index ? { ...s, descriptionJa: value } : s)));
  }

  function updateSymptomSeverity(index: number, value: string) {
    const severity = (value || undefined) as SymptomEntry["severity"];
    setEditedSymptoms((prev) => prev.map((s, i) => (i === index ? { ...s, severity } : s)));
  }

  function toggleEditing(index: number) {
    if (isReadOnly) return;
    setEditingIndex((prev) => (prev === index ? null : index));
  }

  async function handleSave() {
    if (!questionnaire || isConfirmed) {
      return;
    }
    setIsSaving(true);
    setActionMessage(null);
    try {
      const updated = await api.patch<Questionnaire>(`/questionnaire/${questionnaire.id}`, {
        symptoms: editedSymptoms,
        freeNoteJa: editedFreeNoteJa
      });
      setQuestionnaire(updated);
      setEditedSymptoms(updated.symptoms.map((s) => ({ ...s })));
      setEditedFreeNoteJa(updated.freeNoteJa ?? "");
      setEditingIndex(null);
      setActionMessage({ text: "保存しました。", isError: false });
    } catch (err) {
      setActionMessage({ text: describeError(err), isError: true });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirm() {
    if (!questionnaire || isConfirmed) {
      return;
    }
    setIsConfirming(true);
    setActionMessage(null);
    try {
      const result = await api.post<ConfirmResult>(`/questionnaire/${questionnaire.id}/confirm`, {
        nurseId: CONFIRMING_NURSE_ID
      });
      setQuestionnaire(result.questionnaire);
      setEditedSymptoms(result.questionnaire.symptoms.map((s) => ({ ...s })));
      setEditedFreeNoteJa(result.questionnaire.freeNoteJa ?? "");
      setEditingIndex(null);
      setEhrRegistered(result.ehrRegistered);
      setPdfUrl(result.pdfUrl);
      setActionMessage({ text: "確定しました。", isError: false });
      void loadQueue();
    } catch (err) {
      setActionMessage({ text: describeError(err), isError: true });
    } finally {
      setIsConfirming(false);
    }
  }

  function handleOpenPdf() {
    if (!pdfUrl) return;
    window.open(`${API_BASE_URL}${pdfUrl}`, "_blank", "noopener,noreferrer");
  }

  if (isLoading) {
    return (
      <div className="rv-state">
        <div className="rv-state-panel">
          <YuiAvatar size={48} />
          <p className="rv-state-text">問診票を読み込んでいます…</p>
        </div>
      </div>
    );
  }

  if (loadError || !questionnaire) {
    return (
      <div className="rv-state">
        <div className="rv-state-panel">
          <p className="rv-state-text is-error">{loadError ?? "問診票が見つかりませんでした。"}</p>
          <Button variant="secondary" onClick={() => void loadQuestionnaire()}>
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  const receivedAt = formatClock(questionnaire.createdAt);
  const generatedAt = formatClock(questionnaire.createdAt);
  const uniqueCategories = Array.from(new Set(editedSymptoms.map((s) => s.category)));
  const currentQueueChipLabel = isConfirmed ? "確定済み" : "AIドラフト・未確定";

  return (
    <div className="rv-root">
      {/* 左：受付キュー（現在の患者以外はデモ表示の静的プレースホルダー） */}
      <aside className="rv-queue">
        <div className="rv-queue-brand">
          <LogoIcon />
          <span className="rv-queue-brand-name">NurseLink AI</span>
          <span className="rv-queue-brand-dept">外来受付</span>
        </div>

        <div className="rv-queue-tabs">
          <span
            className={`rv-queue-tab${queueTab === "pending" ? " is-active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setQueueTab("pending")}
          >
            確認待ち
          </span>
          <span
            className={`rv-queue-tab${queueTab === "confirmed" ? " is-active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setQueueTab("confirmed")}
          >
            登録済み
          </span>
        </div>

        <div className="rv-queue-list">
          {queueTab === (isConfirmed ? "confirmed" : "pending") && (
            <div className="rv-queue-card is-current">
              <div className="rv-queue-card-head">
                <span className="rv-queue-card-id">{questionnaire.patientDisplayId}</span>
                {receivedAt && <span className="rv-queue-card-time">{receivedAt} 受付</span>}
              </div>
              <div className="rv-queue-card-meta">
                <GlobeIcon />
                {questionnaire.patientLanguage}
                {editedSymptoms[0] ? ` · ${categoryLabel(editedSymptoms[0].category).ja}` : ""}
              </div>
              <span className={`rv-queue-chip${isConfirmed ? "" : " is-draft"}`}>{currentQueueChipLabel}</span>
            </div>
          )}

          {queueError && <p className="rv-queue-error">{queueError}</p>}

          {queue
            .filter((item) => item.id !== questionnaire.id)
            .filter((item) => (queueTab === "confirmed" ? item.status === "confirmed" : item.status === "draft"))
            .map((item) => {
              const itemReceivedAt = formatClock(item.createdAt);
              const isItemConfirmed = item.status === "confirmed";
              const chipLabel = isItemConfirmed ? "確定済み" : item.symptoms.length > 0 ? "AIドラフト・未確定" : "問診中";
              return (
                <div key={item.id} className="rv-queue-card">
                  <div className="rv-queue-card-head">
                    <span className="rv-queue-card-id">{item.patientDisplayId}</span>
                    {itemReceivedAt && <span className="rv-queue-card-time">{itemReceivedAt} 受付</span>}
                  </div>
                  <div className="rv-queue-card-meta">
                    <GlobeIcon />
                    {item.patientLanguage}
                    {item.symptoms[0] ? ` · ${categoryLabel(item.symptoms[0].category).ja}` : ""}
                  </div>
                  <span className={`rv-queue-chip${isItemConfirmed ? "" : " is-draft"}`}>{chipLabel}</span>
                </div>
              );
            })}
        </div>

        <div className="rv-queue-langs">
          <span className="rv-queue-langs-title">本日の対応言語</span>
          <div className="rv-queue-langs-row">
            <span className="rv-queue-lang">English 6</span>
            <span className="rv-queue-lang">中文 4</span>
            <span className="rv-queue-lang">Tiếng Việt 3</span>
          </div>
        </div>
      </aside>

      {/* 本体 */}
      <main className="rv-main">
        <header className="rv-header">
          <div className="rv-header-titles">
            <div className="rv-header-line">
              <h1 className="rv-title">問診票の確認</h1>
              <span className="rv-title-id">{questionnaire.patientDisplayId}</span>
              {isConfirmed ? (
                <Badge kind="confirmed" className="rv-badge-header">
                  <CheckIcon size={14} />
                  確定済み
                </Badge>
              ) : (
                <Badge kind="draft" className="rv-badge-header">
                  <AlertTriangleIcon size={14} color="#97690A" />
                  AIドラフト・看護師確認前
                </Badge>
              )}
            </div>
            <p className="rv-header-meta">
              使用言語 {questionnaire.patientLanguage}
              {receivedAt ? ` ／ 受付 ${receivedAt}` : ""} ／ 対話 {editedSymptoms.length}問
              {generatedAt ? ` ／ 生成 ${generatedAt}` : ""}
            </p>
          </div>

          <div className="rv-header-actions">
            <button type="button" className="rv-hbtn" disabled title="音声データの再生は未実装です">
              <SpeakerIcon />
              音声を再生
            </button>
            <button
              type="button"
              className="rv-hbtn"
              onClick={() => setShowOriginal((v) => !v)}
              aria-pressed={showOriginal}
            >
              <TranslateIcon />
              対訳を並べて表示
              <span className={`rv-switch${showOriginal ? "" : " is-off"}`} aria-hidden="true">
                <span className="rv-switch-knob" />
              </span>
            </button>
          </div>
        </header>

        <div className="rv-body">
          {editedSymptoms.map((symptom, index) => {
            const original = questionnaire.symptoms[index];
            const label = categoryLabel(symptom.category);
            const isEditing = editingIndex === index;
            return (
              <div key={`${symptom.category}-${index}`} className={`rv-row${symptom.needsReview ? " is-review" : ""}`}>
                <div className="rv-row-label">
                  <span className="rv-label-ja">{label.ja}</span>
                  <span className="rv-label-en">{label.en}</span>
                  {symptom.needsReview && (
                    <span className="rv-badge-row">
                      <AlertTriangleIcon size={11} color="#7E5606" />
                      要確認
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="rv-row-main">
                    <div className="rv-edit-field">
                      <label className="rv-edit-label" htmlFor={`symptom-ja-${index}`}>
                        日本語訳
                      </label>
                      <textarea
                        id={`symptom-ja-${index}`}
                        className="rv-edit-textarea"
                        rows={2}
                        value={symptom.descriptionJa}
                        disabled={isReadOnly}
                        onChange={(e) => updateSymptomJa(index, e.target.value)}
                      />
                    </div>
                    <div className="rv-edit-field">
                      <label className="rv-edit-label" htmlFor={`symptom-severity-${index}`}>
                        重症度
                      </label>
                      <select
                        id={`symptom-severity-${index}`}
                        className="rv-edit-select"
                        value={symptom.severity ?? ""}
                        disabled={isReadOnly}
                        onChange={(e) => updateSymptomSeverity(index, e.target.value)}
                      >
                        <option value="">未設定</option>
                        <option value="mild">{SEVERITY_LABELS.mild}</option>
                        <option value="moderate">{SEVERITY_LABELS.moderate}</option>
                        <option value="severe">{SEVERITY_LABELS.severe}</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="rv-row-main">
                    <div className="rv-text">
                      {symptom.descriptionJa}
                      {symptom.severity && (
                        <span className="rv-source-tag" style={{ marginLeft: 8 }}>
                          {SEVERITY_LABELS[symptom.severity]}
                        </span>
                      )}
                    </div>
                    {showOriginal && (
                      <div className="rv-source">
                        <span className="rv-source-tag">原文</span>
                        <span className="rv-source-text">{original?.descriptionOriginal}</span>
                      </div>
                    )}
                    {symptom.needsReview && (
                      <div className="rv-hint">
                        <InfoCircleIcon size={14} color="#97690A" />
                        音声の認識精度が低い区間があります。原文と音声で確認してください。
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className={`rv-row-edit${isEditing ? " is-editing" : ""}`}
                  onClick={() => toggleEditing(index)}
                  disabled={isReadOnly}
                  aria-label={isEditing ? "編集を終える" : "この項目を編集する"}
                >
                  <PencilIcon color={isEditing || symptom.needsReview ? "#FFFFFF" : "#7C9498"} />
                </button>
              </div>
            );
          })}
        </div>

        <footer className="rv-footer">
          <p className="rv-footer-note">
            <ShieldCheckIcon />
            看護師が確定するまで、病院システム登録と診察通訳（④）には引き継がれません。
          </p>
          <div className="rv-footer-actions">
            {actionMessage && (
              <span className={`rv-message${actionMessage.isError ? " is-error" : ""}`}>{actionMessage.text}</span>
            )}
            {!isConfirmed ? (
              <>
                <Button variant="secondary" className="rv-btn-secondary" onClick={() => void handleSave()} disabled={isReadOnly}>
                  {isSaving ? "保存中…" : "下書きとして保存"}
                </Button>
                <Button variant="primary" className="rv-btn-primary" onClick={() => void handleConfirm()} disabled={isReadOnly}>
                  <CheckIcon size={19} />
                  {isConfirming ? "確定中…" : "確定して病院システムへ登録"}
                </Button>
              </>
            ) : (
              pdfUrl && (
                <Button variant="primary" className="rv-btn-primary" onClick={handleOpenPdf}>
                  問診票PDFを印刷/ダウンロードする
                </Button>
              )
            )}
          </div>
        </footer>
      </main>

      {/* 右：レール */}
      <aside className="rv-rail">
        <div className="rv-rail-author">
          <YuiAvatar />
          <div className="rv-rail-author-text">
            <span className="rv-rail-author-name">ユイが作成した下書き</span>
            <span className="rv-rail-author-sub">
              {generatedAt ? `${generatedAt} 生成 ／ ` : ""}テンプレート内質問のみ
            </span>
          </div>
        </div>

        <div className="rv-rail-divider" />

        <div className="rv-rail-section">
          <span className="rv-rail-title">AIが分類した症状カテゴリ</span>
          <div className="rv-rail-chips">
            {uniqueCategories.length > 0 ? (
              uniqueCategories.map((cat) => (
                <span key={cat} className="rv-rail-chip">
                  {categoryLabel(cat).ja}
                </span>
              ))
            ) : (
              <span className="rv-rail-chip is-muted">分類なし</span>
            )}
          </div>
          <span className="rv-rail-note">分類は事前定義カテゴリのみ。診断名・治療方針はAIから出力されません。</span>
        </div>

        <div className="rv-rail-divider" />

        <div className="rv-memo-section">
          <span className="rv-rail-title">看護師メモ（任意）</span>
          <textarea
            className="rv-memo-input"
            rows={3}
            placeholder="問診票に残す申し送りを入力…"
            value={editedFreeNoteJa}
            disabled={isReadOnly}
            onChange={(e) => setEditedFreeNoteJa(e.target.value)}
          />
          {questionnaire.freeNoteOriginal && (
            <span className="rv-memo-source">原文: {questionnaire.freeNoteOriginal}</span>
          )}
        </div>

        <div className="rv-rail-next">
          <span className="rv-rail-next-title">次のステップ</span>
          <span className="rv-rail-next-text">
            {isConfirmed
              ? "模擬電子カルテに登録され、③通訳呼び出しから問診サマリーを引き継げます。"
              : "確定すると模擬電子カルテに登録され、③通訳呼び出しから問診サマリーを引き継げます。"}
          </span>
        </div>
      </aside>
    </div>
  );
}
