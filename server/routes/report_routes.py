from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from db.mongodb import db_manager
from services.report_service import pdf_generator

router = APIRouter(prefix="/reports", tags=["PDF Reports"])

@router.get("/pdf/{prediction_id}")
async def download_prediction_pdf(prediction_id: str):
    doc = db_manager.predictions.find_one({"_id": prediction_id})
    if not doc:
        doc = db_manager.predictions.find_one({"id": prediction_id})
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found for PDF generation."
        )

    try:
        pdf_stream = pdf_generator.generate_report(doc)
        patient_name = doc.get("patient_name") or "Patient"
        safe_name = "".join(c for c in patient_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        filename = f"CuraMed_Report_{safe_name}_{prediction_id[:8]}.pdf"

        headers = {
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "no-cache"
        }

        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate clinical PDF report: {str(e)}"
        )
