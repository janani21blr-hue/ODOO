from enum import Enum
from typing import Optional
from datetime import date, datetime

from sqlmodel import Field, SQLModel, create_engine, Session

# ── Database engine ────────────────────────────────────────────────────────────

DATABASE_URL = "sqlite:///./hrms.db"
engine = create_engine(
    DATABASE_URL, 
    echo=True, 
    connect_args={"check_same_thread": False}
)


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


class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    profile_pic_url: Optional[str] = None


class Payroll(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    basic_salary: float
    allowances: float = Field(default=0.0)
    deductions: float = Field(default=0.0)
    net_salary: float


class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    date: date
    status: str                          # "present", "absent", "half-day"
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None


class LeaveRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    leave_type: str                      # e.g., "sick", "casual", "annual"
    start_date: date
    end_date: date
    status: str = Field(default="Pending")  # "Pending", "Approved", "Rejected"
    remarks: Optional[str] = None
    admin_comment: Optional[str] = None


# ── Helpers & Session Dependency ───────────────────────────────────────────────

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session