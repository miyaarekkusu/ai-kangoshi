import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ConsentScreen from "@/screens/consent";
import IntakeScreen from "@/screens/intake";
import ReviewScreen from "@/screens/review";
import InterpretCallScreen from "@/screens/interpret-call";
import InterpretSessionScreen from "@/screens/interpret-session";
import ManualScreen from "@/screens/manual";

/**
 * 画面ごとの担当エージェントは、このファイルではなく各自の
 * src/screens/<screen>/ 配下のみを編集すること（AGENTS.md 0章）。
 * ルート構成の変更が必要な場合は先に相談する。
 */
export default function App() {
  return (
    <BrowserRouter>
      <HelpLink />
      <Routes>
        <Route path="/" element={<ConsentScreen />} />
        <Route path="/intake" element={<IntakeScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/interpret/call" element={<InterpretCallScreen />} />
        <Route path="/interpret/session" element={<InterpretSessionScreen />} />
        <Route path="/manual" element={<ManualScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * どの画面からでも使い方ガイドに辿り着けるようにする、最小限の常設リンク。
 * /manual 自体には表示しない。
 */
function HelpLink() {
  const path = window.location.pathname;
  if (path === "/manual") return null;
  return (
    <Link
      to="/manual"
      aria-label="使い方ガイド"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 50,
        width: 44,
        height: 44,
        borderRadius: "999px",
        background: "#0E9E92",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}
    >
      ?
    </Link>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <p>ページが見つかりません。</p>
      <Link to="/">同意画面に戻る</Link>
    </div>
  );
}
