"""
看護師・医師向けエンドポイントの認証。

frontend-staff は Supabase Auth（メール+パスワード）でログインし、発行されたJWTを
Authorization: Bearer <token> ヘッダーで送ってくる。ここではそのJWTをSupabaseに
問い合わせて検証し、有効なら看護師のユーザーIDを返す。

これが本当の意味でのアクセス制御（AGENTS.md追加要件）：
フロントを患者アプリ/スタッフアプリに分けただけでは、APIを直接叩く経路は防げない。
②③④に対応するエンドポイント（/questionnaire系、/ws/interpret）は必ずこれを通す。
"""

from functools import lru_cache

from fastapi import Header, HTTPException
from supabase import Client, create_client

from app.config import settings


@lru_cache
def _auth_client() -> Client:
    if not settings.supabase_url or not settings.supabase_secret_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SECRET_KEY が未設定のため看護師認証を検証できません。")
    return create_client(settings.supabase_url, settings.supabase_secret_key)


def _verify_token(token: str) -> str:
    """トークンを検証し、有効なら Supabase のユーザーID を返す。無効なら例外を投げる。"""
    try:
        result = _auth_client().auth.get_user(token)
    except Exception as exc:
        raise HTTPException(401, "認証情報が無効です。再度ログインしてください。") from exc

    if result is None or result.user is None:
        raise HTTPException(401, "認証情報が無効です。再度ログインしてください。")

    return result.user.id


def get_current_nurse(authorization: str | None = Header(default=None)) -> str:
    """
    通常のREST APIエンドポイント用の依存関係。
    `Depends(get_current_nurse)` を付けたエンドポイントの戻り値として、
    確定操作等の記録に使う看護師のユーザーIDが得られる。
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "認証が必要です。ログインしてください。")
    token = authorization.removeprefix("Bearer ").strip()
    return _verify_token(token)


def verify_ws_token(token: str | None) -> str:
    """
    WebSocket用。ブラウザのWebSocket APIはカスタムヘッダーを送れないため、
    クエリパラメータ ?token=<JWT> で受け取ったものをここで検証する。
    """
    if not token:
        raise HTTPException(401, "認証が必要です。ログインしてください。")
    return _verify_token(token)
