"""
音声合成（TTS）。OpenAI TTS APIを使う（多言語対応、Whisperと同じAPIキーを流用できる）。
TTS_API_KEY が未設定の間は音声を生成せず、呼び出し元にNoneを返す（字幕表示のみにフォールバック）。
"""

from openai import OpenAI

from app.config import settings

_VOICE = "alloy"  # 落ち着いた中性的な声。将来的に言語/キャラクターに応じて切り替え可能にする。


def _client() -> OpenAI | None:
    if not settings.tts_api_key:
        return None
    return OpenAI(api_key=settings.tts_api_key)


def synthesize_speech(text: str) -> bytes | None:
    """
    テキストをMP3音声に変換する。APIキー未設定時はNoneを返す
    （フロント側は音声が無ければ字幕のみ表示にフォールバックする）。
    """
    client = _client()
    if client is None or not text.strip():
        return None

    response = client.audio.speech.create(model="tts-1", voice=_VOICE, input=text)
    return response.read()
