from enum import Enum
from typing import Optional
from datetime import date, datetime
from sqlmodel import Field, SQLModel, create_engine

# ── Database engine ────────────────────────────────────────────────────────────
DATABASE_URL = "sqlite:///./hrms.db"
engine = create_engine(DATABASE_URL, echo=True)

# ── Enums ──────────────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    employee = "employee"
    admin = "admin"

# ── Tables ─────────────────────────────────────────────────────────────────────
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str
    role: UserRole

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    date: date
    status: str                          # e.g. "present", "absent", "half-day"
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None

class LeaveRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    leave_type: str                      # e.g. "sick", "casual", "annual"
    start_date: date
    end_date: date
    status: str = "pending"             # "pending" | "approved" | "rejected"

# ── Helper ─────────────────────────────────────────────────────────────────────
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)