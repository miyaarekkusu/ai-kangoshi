/**
 * 問診票の共有スキーマ（フロント/バックエンド共通の契約）。
 * バックエンド側は backend/app/schemas.py の Questionnaire と一致させること。
 * AGENTS.md 3章のガードレール：この形以外の自由記述フィールドを追加しない。
 */

export type QuestionnaireStatus = "draft" | "confirmed";

export interface SymptomEntry {
  category: string; // 事前定義された症状カテゴリのID（例: "fever", "abdominal_pain"）
  descriptionOriginal: string; // 患者の発話（原文）
  descriptionJa: string; // 日本語訳
  severity?: "mild" | "moderate" | "severe";
  needsReview: boolean; // 音声認識/翻訳の確信度が低く、看護師の確認を促す行
}

export interface Questionnaire {
  id: string;
  patientDisplayId: string; // 匿名の受付番号（例: "A-014"）。実名は扱わない
  patientLanguage: string; // BCP47言語コード（例: "en", "vi", "pt-BR"）
  symptoms: SymptomEntry[];
  freeNoteOriginal?: string;
  freeNoteJa?: string;
  status: QuestionnaireStatus;
  createdAt: string; // ISO8601
  confirmedAt?: string; // ISO8601。確定イベントの唯一のトリガー
  confirmedByNurseId?: string;
}

export interface IntakeTurn {
  speaker: "ai" | "patient";
  textOriginal: string;
  textJa?: string;
  audioUrl?: string;
}

export interface ConsentRecord {
  patientDisplayId: string;
  language: string;
  agreedAt: string;
}
