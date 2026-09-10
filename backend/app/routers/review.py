from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response

from app import store
from app.auth import get_current_nurse
from app.camel import CamelModel
from app.schemas import Questionnaire, SymptomEntry
from app.services.pdf_export import build_questionnaire_pdf

router = APIRouter(prefix="/questionnaire", tags=["review"])


@router.get("")
def list_questionnaires(nurse_id: str = Depends(get_current_nurse)) -> list[Questionnaire]:
    """受付キュー表示用の全患者一覧（作成日時の新しい順）。看護師ログイン必須。"""
    return store.list_all()


@router.get("/{questionnaire_id}")
def get_questionnaire(questionnaire_id: str, nurse_id: str = Depends(get_current_nurse)) -> Questionnaire:
    q = store.get(questionnaire_id)
    if q is None:
        raise HTTPException(404, "questionnaire not found")
    return q


class UpdateSymptomsRequest(CamelModel):
    symptoms: list[SymptomEntry]
    free_note_ja: str | None = None


@router.patch("/{questionnaire_id}")
def update_questionnaire(
    questionnaire_id: str, body: UpdateSymptomsRequest, nurse_id: str = Depends(get_current_nurse)
) -> Questionnaire:
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


class ConfirmResponse(CamelModel):
    questionnaire: Questionnaire
    ehr_registered: bool
    pdf_url: str


@router.post("/{questionnaire_id}/confirm")
def confirm_questionnaire(questionnaire_id: str, nurse_id: str = Depends(get_current_nurse)) -> ConfirmResponse:
    """
    看護師の確定操作。この1イベントだけが
      - 模擬病院システムへの登録
      - 問診票PDFの自動生成
    の唯一のトリガーになる（AGENTS.md 3章のガードレール）。
    確定した看護師のIDは、リクエストボディの自己申告ではなく認証済みトークンから取る
    （なりすまし防止）。
    """
    q = store.get(questionnaire_id)
    if q is None:
        raise HTTPException(404, "questionnaire not found")
    if q.status == "confirmed":
        raise HTTPException(409, "already confirmed")

    q.status = "confirmed"
    q.confirmed_at = datetime.now(timezone.utc)
    q.confirmed_by_nurse_id = nurse_id

    # questionnairesテーブルへの保存が、模擬病院システム（Supabase）への登録そのもの
    # （AGENTS.md 4章：DB／模擬病院システムはSupabaseで兼ねる）。
    # 保存に失敗した場合は「確定」を成立させず、看護師に分かる形でエラーを返す
    # （AGENTS.md 5章：無言で失敗させない）。
    try:
        store.save(q)
    except Exception as exc:
        raise HTTPException(502, "模擬病院システムへの登録に失敗しました。もう一度お試しください。") from exc

    return ConfirmResponse(
        questionnaire=q,
        ehr_registered=True,
        pdf_url=f"/questionnaire/{questionnaire_id}/pdf",
    )


@router.get("/{questionnaire_id}/pdf")
def download_pdf(questionnaire_id: str, nurse_id: str = Depends(get_current_nurse)) -> Response:
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
