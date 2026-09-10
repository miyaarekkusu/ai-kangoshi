"""
Supabaseクライアント。SUPABASE_URL / SUPABASE_SERVICE_KEY が未設定の間はNoneを返し、
呼び出し元（app/store.py）はインメモリの仮ストアにフォールバックする。
"""

from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache
def get_supabase() -> Client | None:
    if not settings.supabase_url or not settings.supabase_secret_key:
        return None
    return create_client(settings.supabase_url, settings.supabase_secret_key)
