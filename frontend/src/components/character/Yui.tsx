export type YuiExpression = "idle" | "listening" | "speaking" | "greeting";

interface YuiProps {
  expression?: YuiExpression;
  size?: number;
  className?: string;
}

/**
 * AI看護師キャラクター「ユイ」の共通コンポーネント。
 * Claude Design モックアップ（scratchpad/nurselink/Consent.dc.html, Main.dc.html等）の
 * 実際のSVGマークアップをそのまま移植したもの。⓪①③④の全画面で同一の見た目を使うこと
 * （差別化ポイント「ツールでなくキャラクター」）。
 *
 * - idle/greeting: 口を閉じた微笑み、背景は淡いティール(#DCF0EA)
 * - speaking: 口を開けた発話中の表情、背景は白、周囲にパルスするリング
 * - listening: idleと同じ表情だが、リングをアクセントカラーで表示（マイク入力中を示す）
 */
export function Yui({ expression = "idle", size = 104, className }: YuiProps) {
  const isSpeaking = expression === "speaking";
  const isListening = expression === "listening";
  const showRing = isSpeaking || isListening;
  const ringColor = isListening ? "#E8735A" : "#0E9E92";
  const faceBg = isSpeaking ? "#FFFFFF" : "#DCF0EA";

  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-flex", width: size, height: size }}
    >
      {showRing && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-8%",
            borderRadius: "50%",
            border: `2px solid ${ringColor}`,
            animation: "yui-ring-pulse 1.6s ease-in-out infinite"
          }}
        />
      )}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ position: "relative" }}
        role="img"
        aria-label="AI看護師 ユイ"
      >
        <defs>
          <clipPath id={`yui-clip-${expression}`}>
            <circle cx="100" cy="100" r="100" />
          </clipPath>
        </defs>
        <g clipPath={`url(#yui-clip-${expression})`}>
          <circle cx="100" cy="100" r="100" fill={faceBg} />
          {/* 襟・スクラブ */}
          <path d="M30 200C30 160 60 142 100 142s70 18 70 58z" fill="#17A79C" />
          <path d="M88 143l12 27 12-27-8-3-4 12-4-12z" fill="#F3FBF9" />
          <rect x="90" y="124" width="20" height="26" rx="9" fill="#EEC3A4" />
          {/* 髪 */}
          <ellipse cx="100" cy="92" rx="48" ry="50" fill="#4A3B36" />
          {/* 顔 */}
          <ellipse cx="100" cy="96" rx="41" ry="42" fill="#F8DAC1" />
          <ellipse cx="60" cy="99" rx="7" ry="9" fill="#F0C6A8" />
          <ellipse cx="140" cy="99" rx="7" ry="9" fill="#F0C6A8" />
          <path
            d="M59 90c3-26 19-36 41-36s38 10 41 36c-7-14-21-18-37-16-6 10-20 12-28 6-8 0-14 4-17 10z"
            fill="#4A3B36"
          />
          {/* ナースキャップ */}
          <path d="M72 66V52a8 8 0 0 1 8-8h40a8 8 0 0 1 8 8v14z" fill="#FFFFFF" />
          <rect x="96.5" y="48" width="7" height="14" rx="1.6" fill="#17A79C" />
          <rect x="93" y="51.5" width="14" height="7" rx="1.6" fill="#17A79C" />
          {/* 眉 */}
          <path d="M77 86q9-6 17-1" stroke="#4A3B36" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M106 85q8-5 17 1" stroke="#4A3B36" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* 目 */}
          <ellipse cx="85" cy="100" rx="5.5" ry="6.5" fill="#2C2320" />
          <circle cx="87" cy="97.5" r="2.1" fill="#FFFFFF" />
          <ellipse cx="115" cy="100" rx="5.5" ry="6.5" fill="#2C2320" />
          <circle cx="117" cy="97.5" r="2.1" fill="#FFFFFF" />
          {/* 頬 */}
          <ellipse cx="73" cy="112" rx="8" ry="5" fill="#F09A8C" opacity="0.5" />
          <ellipse cx="127" cy="112" rx="8" ry="5" fill="#F09A8C" opacity="0.5" />
          {/* 口：発話中は開いた楕円、それ以外は微笑み */}
          {isSpeaking ? (
            <ellipse cx="100" cy="115" rx="8" ry="6.5" fill="#9A5F4C" />
          ) : (
            <path d="M92 113q8 8 16 0" stroke="#9A5F4C" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          )}
          {/* 胸元のリボン */}
          <path d="M80 150c0 34 40 34 40 10" stroke="#EAF7F4" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="166" r="8" fill="#EAF7F4" />
        </g>
      </svg>
      <style>{`
        @keyframes yui-ring-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.96); }
          50% { opacity: 0.15; transform: scale(1.06); }
        }
      `}</style>
    </span>
  );
}
