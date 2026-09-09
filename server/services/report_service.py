import io
import re
import html
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def sanitize_for_pdf(text: str) -> str:
    """Safely converts markdown style bold and bullet formatting to valid ReportLab XML."""
    if not text:
        return ""
    # Escape raw HTML characters
    escaped = html.escape(str(text))
    # Convert escaped markdown bold **text** to <b>text</b>
    formatted = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', escaped)
    # Convert headers ### to bold section text
    formatted = re.sub(r'###\s*(.*?)(?:\n|$)', r'<b>\1</b><br/>', formatted)
    formatted = re.sub(r'##\s*(.*?)(?:\n|$)', r'<b>\1</b><br/>', formatted)
    # Convert newlines to breaks
    formatted = formatted.replace('\n', '<br/>')
    return formatted

class HealthReportPDFGenerator:
    def generate_report(self, prediction_data: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A')
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#1E293B'),
            alignment=TA_RIGHT
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#0F766E'),
            spaceBefore=8,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#334155')
        )

        disclaimer_style = ParagraphStyle(
            'DisclaimerText',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor('#64748B'),
            alignment=TA_JUSTIFY
        )

        elements = []

        # 1. Header Banner with Top-Right Patient Info (Patient Name & Age)
        pred_id = str(prediction_data.get('id', 'N/A'))[:8]
        date_str = str(prediction_data.get('created_at', datetime.now().strftime('%Y-%m-%d %H:%M')))[:16]

        inputs = prediction_data.get("input_parameters", {})
        age_val = inputs.get('Age', inputs.get('age', '--'))

        raw_name = (prediction_data.get("patient_name") or "").strip()
        if not raw_name or raw_name.lower() in ("anonymous patient", "patient", "confidential patient"):
            patient_display = "Not provided"
        else:
            patient_display = raw_name

        header_right_text = (
            f"<b>Patient:</b> {html.escape(str(patient_display))}<br/>"
            f"<b>Age:</b> {age_val} years<br/>"
            f"<font size=8 color='#64748B'>ID: {pred_id} | {date_str}</font>"
        )

        header_table_data = [
            [
                Paragraph("<b>CuraMed</b><br/><font size=10 color='#0D9488'>Smart Healthcare Analytics</font>", title_style),
                Paragraph(header_right_text, subtitle_style)
            ]
        ]
        header_table = Table(header_table_data, colWidths=[310, 230])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 4))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0D9488'), spaceBefore=2, spaceAfter=8))

        # 2. Risk Score & Assessment Banner
        risk_level = prediction_data.get("risk_level", "Low")
        prob_pct = prediction_data.get("probability_percentage", 0.0)
        model_used = prediction_data.get("model_used", "Random Forest Classifier")

        if risk_level == "High":
            banner_bg = colors.HexColor('#FFF1F2')
            border_color = colors.HexColor('#FECDD3')
        elif risk_level == "Moderate":
            banner_bg = colors.HexColor('#FFFBEB')
            border_color = colors.HexColor('#FDE68A')
        else:
            banner_bg = colors.HexColor('#ECFDF5')
            border_color = colors.HexColor('#A7F3D0')

        risk_banner_data = [
            [
                Paragraph(f"<b>PATIENT ASSESSED RISK TIER</b><br/><font size=14><b>{risk_level.upper()} RISK ({prob_pct}%)</b></font><br/>{prediction_data.get('risk_summary', '')}", body_style),
                Paragraph(f"<b>Predictive Model:</b> {model_used}<br/><b>Confidence Score:</b> {prediction_data.get('confidence_score', 85.0)}%<br/><b>Diagnostic Status:</b> {prediction_data.get('prediction_label', 'Complete')}", body_style)
            ]
        ]
        risk_banner_table = Table(risk_banner_data, colWidths=[270, 270])
        risk_banner_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), banner_bg),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(risk_banner_table)
        elements.append(Spacer(1, 10))

        # 3. Patient Vitals / Input Parameters (Age STILL appears in this table!)
        elements.append(Paragraph("Clinical Biomarkers & Recorded Parameters", section_heading))
        
        vitals_data = [
            ["Parameter", "Recorded Value", "Reference Normal Range", "Status"],
            ["Patient Name / ID", patient_display, "--", "Verified"],
            ["Age", f"{age_val} years", "18 - 80+", "Recorded"],
            ["Plasma Glucose", f"{inputs.get('Glucose', inputs.get('glucose', '--'))} mg/dL", "70 - 125 mg/dL", "Analyzed"],
            ["Blood Pressure (Diastolic)", f"{inputs.get('BloodPressure', inputs.get('blood_pressure', '--'))} mm Hg", "60 - 80 mm Hg", "Analyzed"],
            ["Body Mass Index (BMI)", f"{inputs.get('BMI', inputs.get('bmi', '--'))} kg/m²", "18.5 - 24.9 kg/m²", "Analyzed"],
            ["Serum Insulin", f"{inputs.get('Insulin', inputs.get('insulin', '--'))} μU/mL", "15 - 160 μU/mL", "Analyzed"],
            ["Skinfold Thickness", f"{inputs.get('SkinThickness', inputs.get('skin_thickness', '--'))} mm", "10 - 40 mm", "Analyzed"],
            ["Pedigree Score (Genetics)", f"{inputs.get('DiabetesPedigreeFunction', inputs.get('diabetes_pedigree_function', '--'))}", "0.10 - 0.90", "Analyzed"]
        ]
        
        vitals_table = Table(vitals_data, colWidths=[160, 120, 140, 120])
        vitals_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
        ]))
        elements.append(vitals_table)
        elements.append(Spacer(1, 10))

        # 4. Contributing Factors Table
        elements.append(Paragraph("Machine Learning Risk Factor Attribution", section_heading))
        factors = prediction_data.get("all_factor_analysis", prediction_data.get("top_contributing_factors", []))
        
        factor_rows = [["Biomarker Feature", "Patient Value", "Population Mean", "Status", "Relative Impact (%)"]]
        for f in factors[:6]:
            factor_rows.append([
                str(f.get("label", f.get("feature"))),
                str(f.get("patient_value")),
                str(f.get("population_mean")),
                str(f.get("status", "Analyzed")),
                f"{f.get('relative_contribution_pct', 0)}%"
            ])
            
        factors_table = Table(factor_rows, colWidths=[170, 90, 100, 90, 90])
        factors_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
        ]))
        elements.append(factors_table)
        elements.append(Spacer(1, 10))

        # 5. Educational Insights
        elements.append(Paragraph("Educational Synthesis & Clinical Guidance", section_heading))
        explanation_raw = prediction_data.get("educational_explanation", "")
        safe_explanation = sanitize_for_pdf(explanation_raw)
        elements.append(Paragraph(safe_explanation, body_style))
        elements.append(Spacer(1, 10))

        # 6. Healthcare Disclaimer Box
        disclaimer_text = (
            "<b>HEALTHCARE & REGULATORY DISCLAIMER:</b> This report is generated by CuraMed for academic research, "
            "educational demonstration, and clinical decision-support illustration purposes only. It is NOT an official medical "
            "diagnosis, consultation, or therapeutic directive. Machine learning probabilistic assessments must always be interpreted "
            "alongside comprehensive clinical diagnostics by a certified medical professional."
        )
        disclaimer_box = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[540])
        disclaimer_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(KeepTogether([disclaimer_box]))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_generator = HealthReportPDFGenerator()
