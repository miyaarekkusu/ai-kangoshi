import uuid
from datetime import datetime, timezone

from fastapi import APIRouter

from app import store
from app.camel import CamelModel
from app.schemas import Questionnaire, SymptomEntry
from app.services import llm

router = APIRouter(prefix="/intake", tags=["intake"])

# 事前定義された質問テンプレート（AGENTS.md 3章：LLMに自由に質問を作らせない）。
# 対応言語は③通訳呼び出し画面（interpret-call）・⓪同意画面（consent/copy.ts）と合わせている。
# "ja-easy" はやさしい日本語（基本語彙・短文）。
# 注: en/ja以外はネイティブチェック未実施の機械的な翻訳。
QUESTION_TEMPLATES = [
    {
        "id": "chief_complaint",
        "text": {
            "en": "What brings you in today?",
            "ja": "今日はどうされましたか？",
            "ja-easy": "きょう、どこが わるいですか？",
            "zh": "今天您哪里不舒服？",
            "vi": "Hôm nay bạn đến vì lý do gì?",
            "ko": "오늘 어떻게 오셨나요?",
            "pt": "O que trouxe você aqui hoje?",
        },
    },
    {
        "id": "duration",
        "text": {
            "en": "Since when have you had this symptom?",
            "ja": "その症状はいつからありますか？",
            "ja-easy": "いつから ちょうしが わるいですか？",
            "zh": "这个症状是从什么时候开始的？",
            "vi": "Triệu chứng này bắt đầu từ khi nào?",
            "ko": "그 증상은 언제부터 있었나요?",
            "pt": "Desde quando você tem esse sintoma?",
        },
    },
    {
        "id": "severity",
        "text": {
            "en": "How severe is it?",
            "ja": "痛みや辛さの程度を教えてください。",
            "ja-easy": "どのくらい つらいですか？",
            "zh": "请告诉我疼痛或不适的程度。",
            "vi": "Vui lòng cho biết mức độ đau hoặc khó chịu.",
            "ko": "통증이나 불편함의 정도를 알려주세요.",
            "pt": "Por favor, diga o quanto dói ou incomoda.",
        },
    },
]


def _question_text(template: dict, lang: str) -> str:
    """テンプレートの訳が無い言語コードは英語にフォールバックする。"""
    return template["text"].get(lang) or template["text"]["en"]


class StartIntakeResponse(CamelModel):
    questionnaire_id: str
    question_id: str
    question_original: str
    question_ja: str  # 患者の言語に関わらず常に標準日本語訳も返す（非日本語話者向け併記キャプション用）


@router.post("/start")
def start_intake(patient_language: str = "en") -> StartIntakeResponse:
    questionnaire_id = f"q-{uuid.uuid4().hex[:8]}"
    questionnaire = Questionnaire(
        id=questionnaire_id,
        patient_display_id=f"A-{uuid.uuid4().hex[:3].upper()}",
        patient_language=patient_language,
        symptoms=[],
        status="draft",
        created_at=datetime.now(timezone.utc),
    )
    store.save(questionnaire)
    q0 = QUESTION_TEMPLATES[0]
    return StartIntakeResponse(
        questionnaire_id=questionnaire_id,
        question_id=q0["id"],
        question_original=_question_text(q0, patient_language),
        question_ja=q0["text"]["ja"],
    )


class MessageRequest(CamelModel):
    questionnaire_id: str
    question_id: str
    patient_text_original: str


class MessageResponse(CamelModel):
    next_question_id: str | None
    next_question_original: str | None
    next_question_ja: str | None
    done: bool


@router.post("/message")
def submit_message(body: MessageRequest) -> MessageResponse:
    """
    患者の発話（音声認識済みテキスト。音声そのものは /media/transcribe で別途テキスト化する）
    をDeepseek APIで症状カテゴリ分類＋日本語訳し、構造化JSONの結果のみをQuestionnaireに追記する
    （AGENTS.md 3章：自由記述の診断文は生成させない）。DEEPSEEK_API_KEY未設定時はモック分類。
    """
    questionnaire = store.get(body.questionnaire_id)
    if questionnaire is None:
        return MessageResponse(next_question_id=None, next_question_original=None, next_question_ja=None, done=True)

    classification = llm.classify_and_translate(body.patient_text_original, questionnaire.patient_language)
    questionnaire.symptoms.append(
        SymptomEntry(
            category=classification["category"],
            description_original=body.patient_text_original,
            description_ja=classification["description_ja"],
            severity=classification["severity"],
            needs_review=classification["needs_review"],
        )
    )
    store.save(questionnaire)

    ids = [q["id"] for q in QUESTION_TEMPLATES]
    current_index = ids.index(body.question_id) if body.question_id in ids else -1
    next_index = current_index + 1

    if next_index >= len(QUESTION_TEMPLATES):
        return MessageResponse(next_question_id=None, next_question_original=None, next_question_ja=None, done=True)

    next_q = QUESTION_TEMPLATES[next_index]
    return MessageResponse(
        next_question_id=next_q["id"],
        next_question_original=_question_text(next_q, questionnaire.patient_language),
        next_question_ja=next_q["text"]["ja"],
        done=False,
    )
