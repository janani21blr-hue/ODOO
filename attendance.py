from typing import Optional
from datetime import date, datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from database import User, Attendance, get_session

router = APIRouter(tags=["Attendance Management"])

# ── Schemas ────────────────────────────────────────────────────────────────────

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    date: date
    status: str
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None

    class Config:
        from_attributes = True


class CheckInRequest(BaseModel):
    user_id: int


class CheckOutRequest(BaseModel):
    user_id: int


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/attendance/{user_id}", response_model=list[AttendanceResponse])
def get_user_attendance(user_id: int, session: Session = Depends(get_session)):
    """Employee view — all attendance records for a specific user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return session.exec(
        select(Attendance).where(Attendance.user_id == user_id)
    ).all()


@router.get("/attendances", response_model=list[AttendanceResponse])
def get_all_attendance(session: Session = Depends(get_session)):
    """Admin view — view attendance records of all employees."""
    return session.exec(select(Attendance)).all()


@router.post("/attendance/check-in", response_model=AttendanceResponse, status_code=201)
def check_in(data: CheckInRequest, session: Session = Depends(get_session)):
    """Employee action — daily check-in."""
    user = session.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    today = date.today()
    existing = session.exec(
        select(Attendance).where(Attendance.user_id == data.user_id, Attendance.date == today)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User has already checked in today.")

    record = Attendance(
        user_id=data.user_id,
        date=today,
        status="present",
        check_in=datetime.now(),
        check_out=None
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.post("/attendance/check-out", response_model=AttendanceResponse)
def check_out(data: CheckOutRequest, session: Session = Depends(get_session)):
    """Employee action — daily check-out."""
    user = session.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    today = date.today()
    existing = session.exec(
        select(Attendance).where(Attendance.user_id == data.user_id, Attendance.date == today)
    ).first()

    if not existing:
        raise HTTPException(status_code=404, detail="No check-in record found for today. Please check-in first.")

    if existing.check_out is not None:
        raise HTTPException(status_code=400, detail="User has already checked out today.")

    existing.check_out = datetime.now()
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing