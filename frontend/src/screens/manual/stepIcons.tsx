import type { SVGProps } from "react";

/**
 * 使い方ガイド画面のアイコン群。
 * Claude Design モックアップ実ソース（scratchpad/nurselink/Guide.dc.html）の
 * SVGパスをそのまま移植している。線色だけは currentColor に置き換え、
 * 配置側（CSS）で #0B7C73 / #C9532F などを指定する。
 * パス・viewBox・stroke-width は変更しないこと。
 */

type IconProps = SVGProps<SVGSVGElement>;

/** 患者向けステップの大きい線画アイコン（モックアップでは 66×66 で表示） */
const stepIconProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
};

/** 補足アイコン（モックアップでは 20〜22px で表示） */
const smallIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
};

/** 1 Agree: 盾＋チェック（緑のボタンを押して開始） */
export function AgreeIcon(props: IconProps) {
  return (
    <svg {...stepIconProps} {...props}>
      <path d="M24 6l14 5.2v11c0 8.4-5.8 14-14 16.2-8.2-2.2-14-7.8-14-16.2v-11z" />
      <path d="M17.6 23.4l4.6 4.6 9-9.6" />
    </svg>
  );
}

/** 2 Speak: マイク＋左右の音波（母国語で話す） */
export function SpeakIcon(props: IconProps) {
  return (
    <svg {...stepIconProps} {...props}>
      <rect x="18.5" y="6" width="11" height="19" rx="5.5" />
      <path d="M12.5 22.5a11.5 11.5 0 0 0 23 0" />
      <path d="M24 34v6" />
      <path d="M18 42h12" />
      <path d="M6.5 17a7 7 0 0 0 0 11" />
      <path d="M41.5 17a7 7 0 0 1 0 11" />
    </svg>
  );
}

/** 3 Wait: クリップボード＋チェック（看護師が回答を確認する） */
export function WaitIcon(props: IconProps) {
  return (
    <svg {...stepIconProps} {...props}>
      <rect x="10" y="9" width="28" height="33" rx="4" />
      <path d="M18 9V6.6a2.6 2.6 0 0 1 2.6-2.6h6.8A2.6 2.6 0 0 1 30 6.6V9" />
      <path d="M17.5 25l4.6 4.6 9-9.6" />
    </svg>
  );
}

/** 4 Consult: 対になった吹き出し（ユイが患者と医師の間を通訳する） */
export function ConsultIcon(props: IconProps) {
  return (
    <svg {...stepIconProps} {...props}>
      <rect x="5" y="8" width="22" height="16" rx="4" />
      <path d="M12 24v6l6.5-6" />
      <rect x="21" y="26" width="22" height="16" rx="4" />
      <path d="M36 42v-4" />
      <path d="M29.5 42v4l-6.5-4" />
    </svg>
  );
}

/** 人＋チェック：「困ったら呼ぶ」帯と「AIは下書きまで」の注記で使用 */
export function NurseCheckIcon(props: IconProps) {
  return (
    <svg {...smallIconProps} {...props}>
      <circle cx="10" cy="8" r="3.3" />
      <path d="M4.2 19.4c0-3.3 2.7-5.4 5.8-5.4 1.1 0 2.1.2 3 .6" />
      <path d="M14.6 17.7l1.9 1.9 3.5-4" />
    </svg>
  );
}

/** 盾＋チェック（小）：「同意なしでは始まらない」の注記 */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...smallIconProps} {...props}>
      <path d="M12 3.6l7 2.6v5.5c0 4.2-2.9 7-7 8.1-4.1-1.1-7-3.9-7-8.1V6.2z" />
      <path d="M9.1 12.1l2.1 2.1 4.1-4.4" />
    </svg>
  );
}

/** 端末＋十字：「確定してから登録」の注記 */
export function RegisterIcon(props: IconProps) {
  return (
    <svg {...smallIconProps} {...props}>
      <rect x="4.4" y="7" width="15.2" height="13" rx="2.4" />
      <path d="M12 3.4V7" />
      <path d="M9.6 13.5h4.8M12 11.1v4.8" />
    </svg>
  );
}

/** 業務フローの矢印（スマホ幅ではCSSで90度回転して↓にする） */
export function FlowArrowIcon(props: IconProps) {
  return (
    <svg {...smallIconProps} strokeWidth={2.2} {...props}>
      <path d="M4.5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** ヘッダー右上のブランドマーク（塗りの盾＋白い心電図波形） */
export function BrandMarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
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
