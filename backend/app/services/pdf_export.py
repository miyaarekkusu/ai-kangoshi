import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.schemas import Questionnaire

# 日本語を含むためデフォルトフォントは使えない。フォント埋め込みは
# Phase 1完了後にNotoSansJP等を backend/app/assets/fonts/ に置いて登録する（未着手）。
# それまでは日本語が文字化けする可能性がある点に注意。


def build_questionnaire_pdf(questionnaire: Questionnaire) -> bytes:
    """
    看護師が②で確定した問診票からPDFを生成する。
    AGENTS.md 3章：確定済み（status == "confirmed"）のデータのみを渡すこと。呼び出し側で保証する。
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=18 * mm, bottomMargin=18 * mm)

    title_style = ParagraphStyle(name="Title", fontSize=16, leading=20, spaceAfter=12)
    label_style = ParagraphStyle(name="Label", fontSize=10, textColor=colors.grey)

    elements = [
        Paragraph("問診票 / Patient Intake Form", title_style),
        Paragraph(f"受付番号 / Patient ID: {questionnaire.patient_display_id}", label_style),
        Paragraph(f"言語 / Language: {questionnaire.patient_language}", label_style),
        Paragraph(
            f"確定日時 / Confirmed At: {questionnaire.confirmed_at.isoformat() if questionnaire.confirmed_at else '-'}",
            label_style,
        ),
        Spacer(1, 10 * mm),
    ]

    table_data = [["カテゴリ", "原文", "日本語訳", "程度"]]
    for s in questionnaire.symptoms:
        table_data.append([s.category, s.description_original, s.description_ja, s.severity or "-"])

    table = Table(table_data, colWidths=[30 * mm, 55 * mm, 55 * mm, 20 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0E9E92")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    elements.append(table)

    if questionnaire.free_note_ja:
        elements.append(Spacer(1, 8 * mm))
        elements.append(Paragraph(f"備考 / Notes: {questionnaire.free_note_ja}", label_style))

    doc.build(elements)
    return buffer.getvalue()
