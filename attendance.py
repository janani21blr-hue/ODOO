from fastapi import APIRouter, FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# -------------------------------------------------------------------
# Router for seamless team integration (app.include_router(router))
# -------------------------------------------------------------------
router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management"]
)

# -------------------------------------------------------------------
# Data Schemas (Matching Dayflow HRMS Requirement 3.4)
# Status Types: Present, Absent, Half-day, Leave
# -------------------------------------------------------------------
class AttendanceRecord(BaseModel):
    id: int
    user_id: int
    date: str          # YYYY-MM-DD
    status: str        # "Present", "Absent", "Half-day", "Leave"
    check_in: Optional[str] = None   # HH:MM:SS
    check_out: Optional[str] = None  # HH:MM:SS
    remarks: Optional[str] = None

class CheckInRequest(BaseModel):
    user_id: int
    remarks: Optional[str] = None

class CheckOutRequest(BaseModel):
    user_id: int
    remarks: Optional[str] = None


# Mock Database (Easy to connect to PostgreSQL/SQLAlchemy later)
FAKE_ATTENDANCE_DB: List[AttendanceRecord] = [
    AttendanceRecord(
        id=1, user_id=101, date="2026-08-20", status="Present",
        check_in="09:02:15", check_out="17:05:30", remarks="On time"
    ),
    AttendanceRecord(
        id=2, user_id=101, date="2026-08-21", status="Present",
        check_in="08:58:00", check_out="17:10:45", remarks="On time"
    ),
    AttendanceRecord(
        id=3, user_id=102, date="2026-08-21", status="Half-day",
        check_in="10:15:00", check_out="14:00:00", remarks="Medical appointment"
    ),
    AttendanceRecord(
        id=4, user_id=101, date="2026-08-22", status="Present",
        check_in="09:00:10", check_out=None, remarks=None
    ),
    AttendanceRecord(
        id=5, user_id=103, date="2026-08-22", status="Leave",
        check_in=None, check_out=None, remarks="Approved Sick Leave"
    ),
]


# -------------------------------------------------------------------
# Endpoints (Dayflow Section 3.4)
# -------------------------------------------------------------------

@router.get("", response_model=List[AttendanceRecord])
def get_all_attendance(
    status: Optional[str] = Query(None, description="Filter by status: Present, Absent, Half-day, Leave"),
    target_date: Optional[str] = Query(None, description="Filter by date YYYY-MM-DD")
):
    """[Admin/HR View - Req 3.4.2] View attendance records of all employees."""
    results = FAKE_ATTENDANCE_DB
    if status:
        results = [r for r in results if r.status.lower() == status.lower()]
    if target_date:
        results = [r for r in results if r.date == target_date]
    return results


@router.get("/{user_id}", response_model=List[AttendanceRecord])
def get_user_attendance(user_id: int):
    """[Employee View - Req 3.4.2] Employees view only their own attendance."""
    return [r for r in FAKE_ATTENDANCE_DB if r.user_id == user_id]


@router.post("/check-in", response_model=AttendanceRecord)
def check_in_employee(payload: CheckInRequest):
    """[Employee Action - Req 3.4.1] Record daily check-in."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    existing = next(
        (r for r in FAKE_ATTENDANCE_DB if r.user_id == payload.user_id and r.date == today_str),
        None
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"User {payload.user_id} already checked in today at {existing.check_in}."
        )

    new_record = AttendanceRecord(
        id=len(FAKE_ATTENDANCE_DB) + 1,
        user_id=payload.user_id,
        date=today_str,
        status="Present",
        check_in=now_time,
        check_out=None,
        remarks=payload.remarks or "Checked in via Dayflow HRMS"
    )

    FAKE_ATTENDANCE_DB.append(new_record)
    return new_record


@router.post("/check-out", response_model=AttendanceRecord)
def check_out_employee(payload: CheckOutRequest):
    """[Employee Action - Req 3.4.1] Record daily check-out."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    existing = next(
        (r for r in FAKE_ATTENDANCE_DB if r.user_id == payload.user_id and r.date == today_str),
        None
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"No check-in record found for User {payload.user_id} today. Check-in first."
        )

    if existing.check_out is not None:
        raise HTTPException(
            status_code=400,
            detail=f"User {payload.user_id} already checked out today at {existing.check_out}."
        )

    existing.check_out = now_time
    if payload.remarks:
        existing.remarks = payload.remarks

    return existing


# Standalone runner for testing independently
app = FastAPI(
    title="Dayflow HRMS - Attendance Subsystem",
    description="Attendance module for Dayflow HRMS",
    version="1.0.0"
)
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("attendance:app", host="0.0.0.0", port=8000, reload=True)