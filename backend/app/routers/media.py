from fastapi import APIRouter, Response, UploadFile

from app.camel import CamelModel
from app.services import stt, tts

router = APIRouter(prefix="/media", tags=["media"])


class TranscribeResponse(CamelModel):
    text: str


@router.post("/transcribe")
async def transcribe(file: UploadFile, language: str | None = None) -> TranscribeResponse:
    """
    音声ファイル（ブラウザのMediaRecorderが出すwebm/mp4等）をWhisper APIでテキスト化する。
    WHISPER_API_KEY未設定時はモック応答を返す。
    フロント側のマイク入力実装（①③④のTODOコメント参照）が音声を送るようになったら、
    現在のテキスト直接送信の代わりにこのエンドポイントを呼ぶ形にする。
    """
    audio_bytes = await file.read()
    text = await stt.transcribe_audio(audio_bytes, file.filename or "audio.webm", language)
    return TranscribeResponse(text=text)


class SpeechRequest(CamelModel):
    text: str


@router.post("/speech")
def speech(body: SpeechRequest) -> Response:
    """
    テキストをMP3音声に変換する（TTS）。TTS_API_KEY未設定時は204を返し、
    フロント側は字幕表示のみにフォールバックすること。
    """
    audio_bytes = tts.synthesize_speech(body.text)
    if audio_bytes is None:
        return Response(status_code=204)
    return Response(content=audio_bytes, media_type="audio/mpeg")
