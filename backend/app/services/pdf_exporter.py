import os
import tempfile
from datetime import datetime
from typing import Any, Dict, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.config import settings
from app.services.report_generator import generate_chart_data, generate_report


def _get_styles() -> Dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "CustomTitle",
            parent=base["Title"],
            fontSize=22,
            spaceAfter=6,
            textColor=colors.HexColor("#1e293b"),
            alignment=TA_CENTER,
        ),
        "subtitle": ParagraphStyle(
            "CustomSubtitle",
            parent=base["Normal"],
            fontSize=12,
            spaceAfter=20,
            textColor=colors.HexColor("#64748b"),
            alignment=TA_CENTER,
        ),
        "section_header": ParagraphStyle(
            "SectionHeader",
            parent=base["Heading2"],
            fontSize=14,
            spaceBefore=16,
            spaceAfter=8,
            textColor=colors.HexColor("#2563eb"),
            borderWidth=0,
            borderPadding=0,
        ),
        "body": ParagraphStyle(
            "CustomBody",
            parent=base["Normal"],
            fontSize=10,
            spaceAfter=6,
            textColor=colors.HexColor("#334155"),
            leading=14,
        ),
        "score_big": ParagraphStyle(
            "ScoreBig",
            parent=base["Normal"],
            fontSize=36,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#2563eb"),
            spaceAfter=4,
        ),
        "score_label": ParagraphStyle(
            "ScoreLabel",
            parent=base["Normal"],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=12,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontSize=10,
            spaceAfter=3,
            textColor=colors.HexColor("#334155"),
            leftIndent=20,
            bulletIndent=10,
            leading=13,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=base["Normal"],
            fontSize=10,
            textColor=colors.white,
            alignment=TA_LEFT,
        ),
    }


def _get_score_color(score: float) -> colors.Color:
    if score >= 80:
        return colors.HexColor("#22c55e")
    elif score >= 60:
        return colors.HexColor("#eab308")
    elif score >= 40:
        return colors.HexColor("#f97316")
    return colors.HexColor("#ef4444")


def _add_header(story: list, styles: Dict[str, ParagraphStyle], report_data: Dict[str, Any]) -> None:
    story.append(Paragraph("Resume Analysis Report", styles["title"]))
    job_title = report_data.get("job_title", "Unknown Position")
    company = report_data.get("company", "")
    resume_file = report_data.get("resume_filename", "resume")
    subtitle = f"{resume_file} &mdash; {job_title}"
    if company:
        subtitle += f" at {company}"
    story.append(Paragraph(subtitle, styles["subtitle"]))
    gen_at = report_data.get("generated_at", datetime.utcnow())
    if isinstance(gen_at, datetime):
        gen_at = gen_at.strftime("%B %d, %Y at %H:%M UTC")
    story.append(Paragraph(f"Generated: {gen_at}", styles["subtitle"]))
    story.append(Spacer(1, 12))


def _add_overall_score(story: list, styles: Dict[str, ParagraphStyle], score: float) -> None:
    story.append(Paragraph(f"{score:.1f}", styles["score_big"]))
    story.append(Paragraph("Overall ATS Score", styles["score_label"]))
    score_color = _get_score_color(score)
    score_table = Table(
        [["", ""]],
        colWidths=[250, 250],
        rowHeights=[8],
    )
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), score_color),
        ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#e2e8f0")),
        ("LINEBELOW", (0, 0), (-1, -1), 0, colors.white),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 16))


def _add_score_breakdown(story: list, styles: Dict[str, ParagraphStyle], breakdown: Dict[str, float]) -> None:
    story.append(Paragraph("Score Breakdown", styles["section_header"]))
    labels = {
        "keyword_match": "Keyword Match",
        "skill_match": "Skill Match",
        "experience_match": "Experience Match",
        "education_match": "Education Match",
        "project_match": "Project Match",
        "certification_match": "Certification Match",
    }
    table_data = [["Category", "Score", "Bar"]]
    for key, label in labels.items():
        val = breakdown.get(key, 0.0)
        bar_len = int(val / 5)
        bar = "=" * bar_len + "-" * (20 - bar_len)
        table_data.append([label, f"{val:.1f}%", bar])
    table = Table(table_data, colWidths=[150, 60, 200])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.HexColor("#f1f5f9")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)
    story.append(Spacer(1, 12))


def _add_section(story: list, styles: Dict[str, ParagraphStyle], title: str, content: Any) -> None:
    story.append(Paragraph(title, styles["section_header"]))
    if isinstance(content, list):
        for item in content:
            if isinstance(item, dict):
                parts = []
                if item.get("title"):
                    parts.append(f"<b>{item['title']}</b>")
                if item.get("description"):
                    parts.append(item["description"])
                if item.get("priority"):
                    parts.append(f"[{item['priority'].upper()}]")
                text = " - ".join(parts) if parts else str(item)
                story.append(Paragraph(f"&bull; {text}", styles["bullet"]))
            else:
                story.append(Paragraph(f"&bull; {item}", styles["bullet"]))
    elif isinstance(content, dict):
        for key, value in content.items():
            if isinstance(value, list):
                val_str = ", ".join(str(v) for v in value) if value else "None"
            else:
                val_str = str(value)
            story.append(Paragraph(f"<b>{key}:</b> {val_str}", styles["body"]))
    else:
        story.append(Paragraph(str(content), styles["body"]))
    story.append(Spacer(1, 8))


def export_analysis_to_pdf(
    analysis_data: Dict[str, Any],
    resume_data: Dict[str, Any],
    job_data: Dict[str, Any],
    output_path: Optional[str] = None,
) -> str:
    if output_path is None:
        timestamp = int(datetime.utcnow().timestamp())
        output_path = os.path.join(
            settings.UPLOAD_FOLDER,
            f"report_{analysis_data.get('id', 'unknown')}_{timestamp}.pdf",
        )
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50,
    )
    styles = _get_styles()
    story = []
    report = generate_report(analysis_data, resume_data, job_data)
    _add_header(story, styles, {
        "job_title": report.job_title,
        "company": report.company,
        "resume_filename": report.resume_filename,
        "generated_at": report.generated_at,
    })
    _add_overall_score(story, styles, report.overall_score)
    breakdown = analysis_data.get("score_breakdown", {})
    if breakdown:
        _add_score_breakdown(story, styles, breakdown)
    for section in report.sections:
        _add_section(story, styles, section.title, section.content)
    story.append(Spacer(1, 20))
    story.append(Paragraph("End of Report", styles["subtitle"]))
    doc.build(story)
    return output_path
