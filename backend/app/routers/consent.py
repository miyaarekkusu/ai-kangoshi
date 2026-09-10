from fastapi import APIRouter

from app.schemas import ConsentRecord

router = APIRouter(prefix="/consent", tags=["consent"])


@router.post("", status_code=201)
def record_consent(record: ConsentRecord) -> ConsentRecord:
    """
    ⓪同意画面からの同意記録。MVP段階ではログ出力のみ（実データ保存はSupabase連携後）。
    同意なしに/intake以降のAPIを呼べないようにするのはフロント側のルーティングで担保する。
    """
    print(f"[consent] {record.patient_display_id} ({record.language}) agreed at {record.agreed_at}")
    return record
