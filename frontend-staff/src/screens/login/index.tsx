import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import "./login.css";

/**
 * 看護師・医師ログイン画面。Supabase Authのメール+パスワード認証を使う。
 * このMVP段階ではアカウント発行はSupabaseダッシュボードから手動で行う想定
 * （サインアップ画面は用意しない。院内スタッフのみが使うため）。
 */
export default function LoginScreen() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (session) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/review";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setIsSubmitting(false);
    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }
    navigate("/review", { replace: true });
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3.4 19.4 6v5.8c0 4.3-3.1 7.3-7.4 8.5-4.3-1.2-7.4-4.2-7.4-8.5V6z" fill="#0E9E92" />
            <path
              d="M7.7 12.2h2.1l1.3-2.7 1.7 4.9 1.3-2.2h2.3"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="login-brand-name">NurseLink AI</span>
        </div>

        <h1 className="login-title">スタッフログイン</h1>
        <p className="login-sub">看護師・医師専用です。患者の方はこちらの画面は使いません。</p>

        <label className="login-field">
          <span className="login-label">メールアドレス</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <label className="login-field">
          <span className="login-label">パスワード</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </label>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="login-submit" disabled={isSubmitting}>
          {isSubmitting ? "確認しています…" : "ログイン"}
        </button>
      </form>
    </div>
  );
}
