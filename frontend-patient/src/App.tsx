import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ConsentScreen from "@/screens/consent";
import IntakeScreen from "@/screens/intake";
import CompleteScreen from "@/screens/complete";
import ManualScreen from "@/screens/manual";

/**
 * 患者向けアプリ（⓪同意・①問診対話・使い方ガイド）。
 * 看護師・医師向け画面（②③④）はこのアプリには含まれない
 * （別デプロイのfrontend-staffのみが持つ。患者の端末にそのコードが配られることもない）。
 */
export default function App() {
  return (
    <BrowserRouter>
      <HelpLink />
      <Routes>
        <Route path="/" element={<ConsentScreen />} />
        <Route path="/intake" element={<IntakeScreen />} />
        <Route path="/complete" element={<CompleteScreen />} />
        <Route path="/manual" element={<ManualScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

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
