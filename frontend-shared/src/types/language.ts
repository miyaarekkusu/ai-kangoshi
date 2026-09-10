/**
 * アプリ全体で使う対応言語の共有定義。
 * ⓪同意画面・①問診対話画面・③通訳呼び出し画面（の対象言語）で共通して使う。
 * 増やす場合はここに追加し、各画面のcopy.ts（存在する場合）に翻訳を追加する。
 */

export type LanguageCode = "en" | "ja" | "ja-easy" | "zh" | "vi" | "ko" | "pt";

export interface LanguageOption {
  code: LanguageCode;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", nativeLabel: "English" },
  { code: "ja", nativeLabel: "日本語" },
  { code: "ja-easy", nativeLabel: "やさしい にほんご" },
  { code: "zh", nativeLabel: "中文" },
  { code: "vi", nativeLabel: "Tiếng Việt" },
  { code: "ko", nativeLabel: "한국어" },
  { code: "pt", nativeLabel: "Português" }
];
