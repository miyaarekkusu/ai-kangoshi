from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response

from app import store
from app.camel import CamelModel
from app.schemas import Questionnaire, SymptomEntry
from app.services.pdf_export import build_questionnaire_pdf

router = APIRouter(prefix="/questionnaire", tags=["review"])


@router.get("/{questionnaire_id}")
def get_questionnaire(questionnaire_id: str) -> Questionnaire:
    q = store.get(questionnaire_id)
    if q is None:
        raise HTTPException(404, "questionnaire not found")
    return q


class UpdateSymptomsRequest(CamelModel):
    symptoms: list[SymptomEntry]
    free_note_ja: str | None = None


@router.patch("/{questionnaire_id}")
def update_questionnaire(questionnaire_id: str, body: UpdateSymptomsRequest) -> Questionnaire:
    """看護師による確認・修正（確定前のみ）。"""
    q = store.get(questionnaire_id)
    if q is None:
        raise HTTPException(404, "questionnaire not found")
    if q.status == "confirmed":
        raise HTTPException(409, "already confirmed; cannot edit")

    q.symptoms = body.symptoms
    q.free_note_ja = body.free_note_ja
    store.save(q)
    return q


class ConfirmRequest(CamelModel):
    nurse_id: str


class ConfirmResponse(CamelModel):
    questionnaire: Questionnaire
    ehr_registered: bool
    pdf_url: str


@router.post("/{questionnaire_id}/confirm")
def confirm_questionnaire(questionnaire_id: str, body: ConfirmRequest) -> ConfirmResponse:
    """
    看護師の確定操作。この1イベントだけが
      - 模擬病院システムへの登録
      - 問診票PDFの自動生成
    の唯一のトリガーになる（AGENTS.md 3章のガードレール）。
    """
    q = store.get(questionnaire_id)
    if q is None:
        raise HTTPException(404, "questionnaire not found")
    if q.status == "confirmed":
        raise HTTPException(409, "already confirmed")

    q.status = "confirmed"
    q.confirmed_at = datetime.now(timezone.utc)
    q.confirmed_by_nurse_id = body.nurse_id
    store.save(q)

    # TODO: 実際のSupabase（模擬病院システム）への登録呼び出しをここに実装する。
    ehr_registered = True

    return ConfirmResponse(
        questionnaire=q,
        ehr_registered=ehr_registered,
        pdf_url=f"/questionnaire/{questionnaire_id}/pdf",
    )


@router.get("/{questionnaire_id}/pdf")
def download_pdf(questionnaire_id: str) -> Response:
    q = store.get(questionnaire_id)
    if q is None:
        raise HTTPException(404, "questionnaire not found")
    if q.status != "confirmed":
        # 確定前のドラフトから紙版を生成できない経路を作らない
        raise HTTPException(409, "questionnaire is not confirmed yet")

    pdf_bytes = build_questionnaire_pdf(q)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="questionnaire-{questionnaire_id}.pdf"'},
    )
