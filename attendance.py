from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="Attendance Service API",
    description="API for tracking user attendance",
    version="1.0.0"
)

# Schema matching: Attendance(id, user_id, date, status, check_in, check_out)
class AttendanceRecord(BaseModel):
    id: int
    user_id: int
    date: str          # Format: YYYY-MM-DD
    status: str        # e.g., "Present", "Absent", "Late"
    check_in: Optional[str] = None   # Format: HH:MM:SS
    check_out: Optional[str] = None  # Format: HH:MM:SS


# Mock database records for hackathon testing
FAKE_ATTENDANCE_DB: List[AttendanceRecord] = [
    AttendanceRecord(
        id=1,
        user_id=101,
        date="2026-08-20",
        status="Present",
        check_in="09:02:15",
        check_out="17:05:30"
    ),
    AttendanceRecord(
        id=2,
        user_id=101,
        date="2026-08-21",
        status="Present",
        check_in="08:58:00",
        check_out="17:10:45"
    ),
    AttendanceRecord(
        id=3,
        user_id=102,
        date="2026-08-21",
        status="Late",
        check_in="10:15:00",
        check_out="18:00:00"
    ),
    AttendanceRecord(
        id=4,
        user_id=101,
        date="2026-08-22",
        status="Present",
        check_in="09:00:10",
        check_out=None
    ),
    AttendanceRecord(
        id=5,
        user_id=103,
        date="2026-08-22",
        status="Absent",
        check_in=None,
        check_out=None
    ),
]


@app.get("/")
def read_root():
    return {"message": "Attendance Service API is running. Go to /docs for interactive Swagger UI."}


@app.get("/attendance/{user_id}", response_model=List[AttendanceRecord])
def get_user_attendance(user_id: int):
    """
    Returns a list of attendance records for the specified user_id.
    """
    user_records = [record for record in FAKE_ATTENDANCE_DB if record.user_id == user_id]
    return user_records


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("attendance:app", host="0.0.0.0", port=8000, reload=True)