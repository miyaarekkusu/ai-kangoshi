from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services import llm

router = APIRouter(tags=["interpret"])

_LANGUAGE_LABELS: dict[str, str] = {
    "en": "English",
    "ja": "日本語",
    "zh": "中文",
    "vi": "Tiếng Việt",
    "ko": "한국어",
    "pt": "Português",
}


def _label(code: str) -> str:
    return _LANGUAGE_LABELS.get(code, code)


@router.websocket("/ws/interpret/{session_id}")
async def interpret_session(websocket: WebSocket, session_id: str, lang: str = "en"):
    """
    ④診察通訳画面向けの疑似リアルタイム通訳チャンネル。
    発話ブロック単位でメッセージを受け取り、翻訳結果を返す
    （AGENTS.md 2章：真のストリーミング型双方向通訳は実装しない）。

    接続時にクエリパラメータ ?lang=<患者の言語コード> を渡すこと（デフォルト en）。
    医師の発話（日本語）は lang へ、患者の発話（lang）は日本語へ翻訳する。

    受信メッセージ想定: {"speaker": "doctor" | "patient", "textOriginal": str}
    送信メッセージ想定: {"speaker": ..., "textOriginal": ..., "textTranslated": ...}
    （他のREST APIと同様、WebSocketのJSONキーもcamelCaseに揃えている）

    翻訳はDeepseek API（app/services/llm.py）を使う。DEEPSEEK_API_KEY未設定時はモック翻訳。
    """
    await websocket.accept()
    patient_language_label = _label(lang)
    try:
        while True:
            payload = await websocket.receive_json()
            speaker = payload.get("speaker", "unknown")
            text_original = payload.get("textOriginal", "")

            if speaker == "doctor":
                text_translated = llm.translate_text(text_original, "日本語", patient_language_label)
            elif speaker == "patient":
                text_translated = llm.translate_text(text_original, patient_language_label, "日本語")
            else:
                text_translated = text_original

            await websocket.send_json(
                {
                    "speaker": speaker,
                    "textOriginal": text_original,
                    "textTranslated": text_translated,
                }
            )
    except WebSocketDisconnect:
        print(f"[interpret] session {session_id} disconnected")
