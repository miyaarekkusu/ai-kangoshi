from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    環境変数から読み込む設定。実際の値は .env（ローカル）または
    `flyctl secrets set`（本番）で与える。ここにキーの値を書かない。
    """

    cors_allow_origins: list[str] = ["http://localhost:5173"]

    # 外部APIキー（未設定の間は各サービスがモック応答にフォールバックする）
    whisper_api_key: str | None = None
    tts_api_key: str | None = None
    deepseek_api_key: str | None = None
    supabase_url: str | None = None
    # Supabaseの新しいキー体系での名称（旧: service_role key）。
    # サーバー側専用の全権限キー。publishable key（旧: anon key）ではない。
    supabase_secret_key: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"  # SUPABASE_PUBLISHABLE_KEY/JWKS_URL等、使わない項目があってもエラーにしない


settings = Settings()
