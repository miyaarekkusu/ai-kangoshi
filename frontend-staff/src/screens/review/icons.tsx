/**
 * ② 問診票確認画面のアイコン群。
 * Claude Design モックアップ（NurseReview.dc.html）のインラインSVGをそのまま移植したもの。
 * パス・stroke幅・サイズはモックアップの値を変更しないこと。
 */

interface IconProps {
  size?: number;
  color?: string;
}

/** ロゴ（盾＋心電図） */
export function LogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

/** 言語（地球儀） */
export function GlobeIcon({ size = 14, color = "#4E7076" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5z" />
    </svg>
  );
}

/** 警告（三角） */
export function AlertTriangleIcon({ size = 14, color = "#97690A" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4.6l8.4 14.8H3.6z" />
      <path d="M12 10.4v3.9" />
      <circle cx="12" cy="17" r="1" fill={color} stroke="none" />
    </svg>
  );
}

/** 注意（丸に i） */
export function InfoCircleIcon({ size = 14, color = "#97690A" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.4" />
      <circle cx="12" cy="7.8" r="1" fill={color} stroke="none" />
    </svg>
  );
}

/** スピーカー（音声再生） */
export function SpeakerIcon({ size = 17, color = "#4E7076" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 9.4h3.2L12.6 6v12L8.2 14.6H5z" />
      <path d="M16.3 9.6a3.6 3.6 0 0 1 0 4.8" />
      <path d="M18.8 7a7 7 0 0 1 0 10" />
    </svg>
  );
}

/** 翻訳（対訳表示） */
export function TranslateIcon({ size = 17, color = "#4E7076" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.6 6.6h9.2" />
      <path d="M8.2 4.4v2.2" />
      <path d="M10.6 6.6c0 3.6-2.6 6.7-6.2 8.3" />
      <path d="M5.4 10.2c1 2.1 3.1 3.7 5.6 4.6" />
      <path d="M12.6 20l3.9-9.2 3.9 9.2" />
      <path d="M14 16.9h4.9" />
    </svg>
  );
}

/** 編集（鉛筆） */
export function PencilIcon({ size = 16, color = "#7C9498" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4L18.4 9.6a2.5 2.5 0 0 0-3.5-3.5L4.5 16.5z" />
    </svg>
  );
}

/** チェック */
export function CheckIcon({ size = 19, color = "#FFFFFF" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.6l4.5 4.4L19 7.4" />
    </svg>
  );
}

/** 盾＋チェック（ガードレール注記） */
export function ShieldCheckIcon({ size = 17, color = "#9BB0B3" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "0 0 auto" }}
      aria-hidden="true"
    >
      <path d="M12 3.6l7 2.6v5.5c0 4.2-2.9 7-7 8.1-4.1-1.1-7-3.9-7-8.1V6.2z" />
      <path d="M9.1 12.1l2.1 2.1 4.1-4.4" />
    </svg>
  );
}

/** 再生（三角） */
export function PlayIcon({ size = 12, color = "#FFFFFF" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M8 5.4l11 6.6-11 6.6z" />
    </svg>
  );
}

/** ユイ（キャラクター）のアバター。モックアップ右レール頭部のSVGをそのまま移植 */
export function YuiAvatar({ size = 42 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ flex: "0 0 auto" }} aria-hidden="true">
      <defs>
        <clipPath id="nr-char">
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>
      <g clipPath="url(#nr-char)">
        <circle cx="100" cy="100" r="100" fill="#DCF0EA" />
        <path d="M30 200C30 160 60 142 100 142s70 18 70 58z" fill="#17A79C" />
        <rect x="90" y="124" width="20" height="26" rx="9" fill="#EEC3A4" />
        <ellipse cx="100" cy="92" rx="48" ry="50" fill="#4A3B36" />
        <ellipse cx="100" cy="96" rx="41" ry="42" fill="#F8DAC1" />
        <path
          d="M59 90c3-26 19-36 41-36s38 10 41 36c-7-14-21-18-37-16-6 10-20 12-28 6-8 0-14 4-17 10z"
          fill="#4A3B36"
        />
        <path d="M72 66V52a8 8 0 0 1 8-8h40a8 8 0 0 1 8 8v14z" fill="#FFFFFF" />
        <rect x="96.5" y="48" width="7" height="14" rx="1.6" fill="#17A79C" />
        <rect x="93" y="51.5" width="14" height="7" rx="1.6" fill="#17A79C" />
        <ellipse cx="85" cy="100" rx="5.5" ry="6.5" fill="#2C2320" />
        <ellipse cx="115" cy="100" rx="5.5" ry="6.5" fill="#2C2320" />
        <ellipse cx="73" cy="112" rx="8" ry="5" fill="#F09A8C" opacity="0.5" />
        <ellipse cx="127" cy="112" rx="8" ry="5" fill="#F09A8C" opacity="0.5" />
        <path d="M92 113q8 8 16 0" stroke="#9A5F4C" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
