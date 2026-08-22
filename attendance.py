from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

# Import Attendance model and get_session dependency from your team's database.py
from database import get_session, Attendance, engine

router = APIRouter(
    tags=["Attendance"]
)

@router.get("/attendance/{user_id}")
def get_user_attendance(user_id: int, session: Session = Depends(get_session)):
    """
    Get all attendance records for a specific user ID.
    Exact team pattern: session.exec(select(Attendance)...).all()
    """
    statement = select(Attendance).where(Attendance.user_id == user_id)
    return session.exec(statement).all()


@router.get("/attendance")
def get_all_attendance(
    status: Optional[str] = Query(None),
    target_date: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    """[Admin View] Get all attendance records with optional filters."""
    statement = select(Attendance)
    if status:
        statement = statement.where(Attendance.status == status)
    if target_date:
        statement = statement.where(Attendance.date == target_date)
    return session.exec(statement).all()


@router.post("/attendance/check-in")
def check_in_employee(user_id: int, remarks: Optional[str] = None, session: Session = Depends(get_session)):
    """[Employee Action] Record daily check-in."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    existing = session.exec(
        select(Attendance).where(Attendance.user_id == user_id, Attendance.date == today_str)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"User {user_id} has already checked in today at {existing.check_in}."
        )

    new_record = Attendance(
        user_id=user_id,
        date=today_str,
        status="Present",
        check_in=now_time,
        check_out=None,
        remarks=remarks or "Checked in via Dayflow HRMS"
    )

    session.add(new_record)
    session.commit()
    session.refresh(new_record)
    return new_record


@router.post("/attendance/check-out")
def check_out_employee(user_id: int, remarks: Optional[str] = None, session: Session = Depends(get_session)):
    """[Employee Action] Record daily check-out."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    existing = session.exec(
        select(Attendance).where(Attendance.user_id == user_id, Attendance.date == today_str)
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"No check-in record found for User {user_id} today."
        )

    if existing.check_out is not None:
        raise HTTPException(
            status_code=400,
            detail=f"User {user_id} has already checked out today at {existing.check_out}."
        )

    existing.check_out = now_time
    if remarks:
        existing.remarks = remarks

    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing