import { createClient } from "@supabase/supabase-js";

/**
 * 看護師・医師ログイン専用のSupabaseクライアント（フロント側）。
 * publishable/anon keyのみを使う（secret keyはバックエンドのみが持つ）。
 * このクライアントはSupabase Authでのログイン・セッション管理にのみ使い、
 * 問診票データ等のテーブルには直接アクセスしない（すべてFastAPI経由）。
 */
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
