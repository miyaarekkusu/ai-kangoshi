"""
問診票の永続化。

SUPABASE_URL / SUPABASE_SERVICE_KEY が設定されていれば Supabase の
`questionnaires` テーブル（supabase/schema.sql）を使う。
未設定の間はインメモリの仮ストアにフォールバックする
（プロセス再起動でデータは消える。ローカル開発・デモ用途のみ）。
"""

from datetime import datetime, timezone

from app.db import get_supabase
from app.schemas import Questionnaire, SymptomEntry

_TABLE = "questionnaires"

# フォールバック用インメモリストア
_questionnaires: dict[str, Questionnaire] = {}


def _to_row(questionnaire: Questionnaire) -> dict:
    return questionnaire.model_dump(mode="json", by_alias=False)


def seed() -> None:
    """デモ用の初期データを1件用意する（Supabase使用時は既存データがあれば何もしない）。"""
    client = get_supabase()
    if client is not None:
        existing = client.table(_TABLE).select("id").eq("id", "q-001").execute()
        if existing.data:
            return
    elif _questionnaires:
        return

    q = Questionnaire(
        id="q-001",
        patient_display_id="A-014",
        patient_language="en",
        symptoms=[
            SymptomEntry(
                category="fever",
                description_original="I've had a fever since last night, around 38.5C.",
                description_ja="昨夜から発熱があり、38.5度程度です。",
                severity="moderate",
                needs_review=False,
            ),
            SymptomEntry(
                category="headache",
                description_original="My head hurts, especially around the forehead.",
                description_ja="頭痛があります。特に額のあたりが痛みます。",
                severity="mild",
                needs_review=True,
            ),
        ],
        free_note_original="I also feel a bit dizzy.",
        free_note_ja="少しめまいも感じます。",
        status="draft",
        created_at=datetime.now(timezone.utc),
    )
    save(q)


def get(questionnaire_id: str) -> Questionnaire | None:
    client = get_supabase()
    if client is not None:
        result = client.table(_TABLE).select("*").eq("id", questionnaire_id).limit(1).execute()
        if not result.data:
            return None
        return Questionnaire(**result.data[0])

    return _questionnaires.get(questionnaire_id)


def save(questionnaire: Questionnaire) -> None:
    client = get_supabase()
    if client is not None:
        client.table(_TABLE).upsert(_to_row(questionnaire)).execute()
        return

    _questionnaires[questionnaire.id] = questionnaire
