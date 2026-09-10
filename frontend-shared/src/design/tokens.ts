/**
 * Claude Design モックアップの実ソース（scratchpad/nurselink/*.dc.html）から抽出した
 * 実際の配色・書体トークン。前バージョンは概略の色（推測値）だったため、
 * モックアップ実物のhex値に合わせて置き換えている。
 * 変更する場合はモックアップ側との整合を確認すること（AGENTS.md 7章参照）。
 */

export const color = {
  primary: "#0E9E92", // ティール。ブランド基調色、進行・確定などの主要アクション
  primaryDark: "#0B7C73", // リンク・強調テキスト
  primaryDarker: "#075F58", // hover
  primaryDeep: "#17A79C", // キャラクターの服・アイコンの塗り
  accent: "#E8735A", // コーラル。患者に行動を促す箇所のみに使う差し色（マイクボタン等）
  accentLight: "#F0836A", // 上記のグラデーション用ハイライト

  backgroundPatient: "#F1F8F5", // ⓪①：患者向けスマホ画面の背景
  backgroundStaff: "#F3F7F7", // ②③④：看護師/医師向け画面の背景
  surface: "#FFFFFF",
  surfaceTint: "#E4F4F0", // 選択中チップ・確定バッジ等の淡いティール背景

  border: "#E2EAEB",
  borderSoft: "#D6E7E2",

  textPrimary: "#16292C",
  textSecondary: "#4E7076",
  textMuted: "#7C9498",
  textOnPrimary: "#FFFFFF",

  warning: "#97690A",
  warningBg: "#FDF3DE",
  danger: "#C9532F",
  dangerBg: "#FDEEE9",

  // ④診察通訳画面：会話パネルのみ暗い面にする（診察室で離れた位置から読む前提）
  panelDark: "#16292C",
  panelDarkDeep: "#12292E"
} as const;

export const font = {
  // 患者/キャラクター側の見出し・対話文
  character: "'Zen Maru Gothic', 'Zen Kaku Gothic New', sans-serif",
  // 看護師・医師向けの業務画面
  business: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif"
} as const;

export const space = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px"
} as const;

export const radius = {
  sm: "8px",
  md: "16px",
  lg: "24px",
  pill: "999px"
} as const;

export const breakpoint = {
  mobile: "480px",
  tablet: "768px",
  desktop: "1024px"
} as const;

export const touchTarget = {
  minSize: "44px"
} as const;
