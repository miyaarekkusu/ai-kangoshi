"""
音声認識（STT）。OpenAI Whisper APIを使う。
WHISPER_API_KEY が未設定の間はモック応答にフォールバックする（ローカル開発用）。
"""

from openai import OpenAI

from app.config import settings


def _client() -> OpenAI | None:
    if not settings.whisper_api_key:
        return None
    return OpenAI(api_key=settings.whisper_api_key)


async def transcribe_audio(audio_bytes: bytes, filename: str, language: str | None = None) -> str:
    """
    音声データ（webm/mp4/wav等、ブラウザのMediaRecorderが出す形式）をテキスト化する。
    APIキー未設定時は呼び出し元にモック応答である旨を返す。
    """
    client = _client()
    if client is None:
        return "（音声認識は未設定のためモック応答です。WHISPER_API_KEYを設定してください）"

    # OpenAI SDKはファイルオブジェクト（名前付きバイト列）を要求する
    file_tuple = (filename, audio_bytes)
    kwargs = {}
    if language:
        kwargs["language"] = language.split("-")[0]

    result = client.audio.transcriptions.create(model="whisper-1", file=file_tuple, **kwargs)
    return result.text
