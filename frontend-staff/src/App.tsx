import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { RequireAuth } from "@/lib/RequireAuth";
import LoginScreen from "@/screens/login";
import ReviewScreen from "@/screens/review";
import InterpretCallScreen from "@/screens/interpret-call";
import InterpretSessionScreen from "@/screens/interpret-session";
import ManualScreen from "@/screens/manual";

/**
 * 看護師・医師向けアプリ（ログイン・②問診票確認・③通訳呼び出し・④診察通訳）。
 * 患者向けの⓪①はこのアプリには含まれない（frontend-patientのみが持つ）。
 * /login以外はすべてRequireAuthで保護し、未ログインなら/loginへ飛ばす。
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/review"
            element={
              <RequireAuth>
                <ReviewScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/interpret/call"
            element={
              <RequireAuth>
                <InterpretCallScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/interpret/session"
            element={
              <RequireAuth>
                <InterpretSessionScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/manual"
            element={
              <RequireAuth>
                <ManualScreen />
              </RequireAuth>
            }
          />
          <Route path="/" element={<Navigate to="/review" replace />} />
          <Route path="*" element={<Navigate to="/review" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
