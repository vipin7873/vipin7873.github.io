import os
import uuid
import json
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.models.assessment import Assessment
from app.services.audio_analyzer import analyze_audio

router = APIRouter(prefix="/api", tags=["assessments"])

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def _allowed_file(filename: str) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS


@router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not _allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 50 MB.")

    _, ext = os.path.splitext(file.filename.lower())
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(UPLOAD_DIR, unique_name)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(contents)

    try:
        result = analyze_audio(save_path)
    except Exception as exc:
        os.remove(save_path)
        raise HTTPException(status_code=422, detail=f"Audio analysis failed: {str(exc)}")

    assessment = Assessment(
        filename=unique_name,
        original_filename=file.filename,
        pitch_score=result.pitch_score,
        tempo_score=result.tempo_score,
        consistency_score=result.consistency_score,
        overall_score=result.overall_score,
        strengths=json.dumps(result.strengths),
        weaknesses=json.dumps(result.weaknesses),
        feedback=result.feedback,
        duration=result.duration,
        tempo_bpm=result.tempo_bpm,
        created_at=datetime.utcnow(),
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)

    return JSONResponse(
        status_code=201,
        content={
            "id": assessment.id,
            "message": "Analysis complete",
        },
    )


@router.get("/result/{assessment_id}")
async def get_result(assessment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assessment).where(Assessment.id == assessment_id)
    )
    assessment = result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "id": assessment.id,
        "filename": assessment.original_filename,
        "pitch_score": assessment.pitch_score,
        "tempo_score": assessment.tempo_score,
        "consistency_score": assessment.consistency_score,
        "overall_score": assessment.overall_score,
        "strengths": json.loads(assessment.strengths),
        "weaknesses": json.loads(assessment.weaknesses),
        "feedback": assessment.feedback,
        "duration": assessment.duration,
        "tempo_bpm": assessment.tempo_bpm,
        "created_at": assessment.created_at.isoformat(),
    }


@router.get("/assessments")
async def list_assessments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Assessment).order_by(Assessment.created_at.desc()).limit(20)
    )
    assessments = result.scalars().all()
    return [
        {
            "id": a.id,
            "filename": a.original_filename,
            "overall_score": a.overall_score,
            "created_at": a.created_at.isoformat(),
        }
        for a in assessments
    ]
