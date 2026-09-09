"""
症状分類・翻訳。Deepseek API（OpenAI SDK互換）を使う。

AGENTS.md 3章のガードレール:
  - 出力は構造化JSON（固定スキーマ）に限定する。自由記述の診断文・治療方針は生成させない。
  - 質問生成自体はここでは行わない（事前定義テンプレートの範囲：app/routers/intake.py参照）。
  - API障害・スキーマ不一致時は、黙って何かを推測せず、要確認フラグ付きの安全な既定値に倒す。

DEEPSEEK_API_KEY が未設定の間はモック分類にフォールバックする（ローカル開発用）。
"""

from __future__ import annotations

import json
from typing import TypedDict

from openai import OpenAI

from app.config import settings

_BASE_URL = "https://api.deepseek.com"

_SYSTEM_PROMPT = """あなたは多言語対応AI看護師アプリの問診支援システムの一部です。
患者の発話から症状情報を構造化するだけの役割であり、診断や治療方針の判断は一切行いません。

出力は必ず次のJSONスキーマのみに従ってください。スキーマ外のフィールドや、
診断名・治療方針・処方薬の提案を示唆する文言を一切含めないでください。

{
  "category": string,   // 次のいずれか: fever, headache, abdominal_pain, cough, nausea, general
  "description_ja": string,  // 患者の発話の日本語訳（原文の情報量を変えずに翻訳する）
  "severity": "mild" | "moderate" | "severe" | null,  // 発話から明確に読み取れる場合のみ設定
  "needs_review": boolean  // 翻訳・分類の確信度が低い、曖昧、聞き取りにくい場合はtrue
}
"""


class SymptomClassification(TypedDict):
    category: str
    description_ja: str
    severity: str | None
    needs_review: bool


def _client() -> OpenAI | None:
    if not settings.deepseek_api_key:
        return None
    return OpenAI(api_key=settings.deepseek_api_key, base_url=_BASE_URL)


def _mock_classify(patient_text: str) -> SymptomClassification:
    return {
        "category": "general",
        "description_ja": f"（モック翻訳）{patient_text}",
        "severity": None,
        "needs_review": True,
    }


def classify_and_translate(patient_text: str, patient_language: str) -> SymptomClassification:
    """
    患者の発話（原文）から、症状カテゴリ分類＋日本語訳を構造化JSONで取得する。
    APIキー未設定、通信失敗、スキーマ不一致のいずれの場合も、
    要確認フラグ付きのモック分類に安全側フォールバックする。
    """
    client = _client()
    if client is None:
        return _mock_classify(patient_text)

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": f"患者の言語: {patient_language}\n患者の発話: {patient_text}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content or "{}"
        data = json.loads(content)

        category = str(data.get("category") or "general")
        severity = data.get("severity")
        if severity not in ("mild", "moderate", "severe"):
            severity = None

        return {
            "category": category,
            "description_ja": str(data.get("description_ja") or patient_text),
            "severity": severity,
            "needs_review": bool(data.get("needs_review", True)),
        }
    except Exception:
        # API障害・JSON不正時は黙って推測せず、要確認フラグ付きの安全な既定値に倒す
        result = _mock_classify(patient_text)
        result["description_ja"] = f"（分類APIエラー・要確認）{patient_text}"
        return result


def translate_text(text: str, source_language: str, target_language: str) -> str:
    """
    ④診察通訳画面向けの単純な翻訳（症状分類は行わない）。
    APIキー未設定・API障害時はモック翻訳（原文にラベルを付けるだけ）にフォールバックする。
    """
    if not text.strip():
        return ""

    client = _client()
    if client is None:
        return f"（モック翻訳）{text}"

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "あなたは医療現場向けの翻訳者です。与えられた文を"
                        f"{source_language}から{target_language}へ翻訳してください。"
                        "診断や助言を加えず、翻訳結果の文章のみを出力してください。"
                    ),
                },
                {"role": "user", "content": text},
            ],
            temperature=0.2,
        )
        translated = response.choices[0].message.content
        return translated.strip() if translated else f"（モック翻訳）{text}"
    except Exception:
        return f"（翻訳APIエラー・モック翻訳）{text}"
