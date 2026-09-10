from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.camel import CamelModel

# フロントエンドの src/types/questionnaire.ts と一致させること（AGENTS.md 3章）。
# 自由記述の診断文を追加しない。フィールドを増やす場合は両方を同時に更新する。
# JSON上のキーはcamelCase（例: descriptionOriginal）。Python側はsnake_caseのまま扱える（app/camel.py参照）。

Severity = Literal["mild", "moderate", "severe"]
QuestionnaireStatus = Literal["draft", "confirmed"]


class SymptomEntry(CamelModel):
    category: str
    description_original: str
    description_ja: str
    severity: Severity | None = None
    needs_review: bool = False


class Questionnaire(CamelModel):
    id: str
    patient_display_id: str
    patient_language: str
    symptoms: list[SymptomEntry]
    free_note_original: str | None = None
    free_note_ja: str | None = None
    status: QuestionnaireStatus = "draft"
    created_at: datetime
    confirmed_at: datetime | None = None
    confirmed_by_nurse_id: str | None = None


class ConsentRecord(CamelModel):
    patient_display_id: str
    language: str
    agreed_at: datetime = Field(default_factory=datetime.utcnow)


class IntakeTurn(CamelModel):
    speaker: Literal["ai", "patient"]
    text_original: str
    text_ja: str | None = None
