from contextlib import asynccontextmanager
from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from database import (
    User,
    UserRole,
    LeaveRequest,
    create_db_and_tables,
    get_session,
)

# Import sub-routers
from profile import router as profile_router
from payroll import router as payroll_router
from attendance import router as attendance_router


# ── Lifespan (creates all DB tables on startup) ────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="HRMS Backend API", lifespan=lifespan)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Sub-Routers ────────────────────────────────────────────────────────
app.include_router(profile_router)
app.include_router(payroll_router)
app.include_router(attendance_router)


# ══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════════════

class SignupRequest(BaseModel):
    email: str
    password: str
    role: UserRole          # Only accepts "employee" or "admin"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    user_id: int
    role: str


@app.post("/signup", response_model=AuthResponse, status_code=201, tags=["Authentication"])
def signup(data: SignupRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(email=data.email, password=data.password, role=data.role)
    session.add(user)
    session.commit()
    session.refresh(user)

    return AuthResponse(user_id=user.id, role=user.role.value)


@app.post("/login", response_model=AuthResponse, tags=["Authentication"])
def login(data: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return AuthResponse(user_id=user.id, role=user.role.value)


# ══════════════════════════════════════════════════════════════════════════════
# LEAVE MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

class LeaveApplyRequest(BaseModel):
    user_id: int
    leave_type: str
    start_date: date
    end_date: date
    remarks: Optional[str] = None


class LeaveActionRequest(BaseModel):
    admin_comment: Optional[str] = None


class LeaveResponse(BaseModel):
    id: int
    user_id: int
    leave_type: str
    start_date: date
    end_date: date
    status: str
    remarks: Optional[str]
    admin_comment: Optional[str]

    class Config:
        from_attributes = True


@app.post("/leave/apply", response_model=LeaveResponse, status_code=201, tags=["Leave Management"])
def apply_leave(data: LeaveApplyRequest, session: Session = Depends(get_session)):
    """Employee applies for leave (defaults to Pending)."""
    user = session.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    leave = LeaveRequest(
        user_id=data.user_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        remarks=data.remarks,
        status="Pending",
    )
    session.add(leave)
    session.commit()
    session.refresh(leave)
    return leave


@app.get("/leave/{user_id}", response_model=list[LeaveResponse], tags=["Leave Management"])
def get_leaves_for_user(user_id: int, session: Session = Depends(get_session)):
    """Employee view — all leave requests for a specific user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return session.exec(
        select(LeaveRequest).where(LeaveRequest.user_id == user_id)
    ).all()


@app.get("/leaves", response_model=list[LeaveResponse], tags=["Leave Management"])
def get_all_leaves(session: Session = Depends(get_session)):
    """Admin view — all leave requests across the company."""
    return session.exec(select(LeaveRequest)).all()


@app.post("/leave/{leave_id}/approve", response_model=LeaveResponse, tags=["Leave Management"])
def approve_leave(
    leave_id: int,
    data: LeaveActionRequest,
    session: Session = Depends(get_session),
):
    """Admin approves a leave request."""
    leave = session.get(LeaveRequest, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    leave.status = "Approved"
    leave.admin_comment = data.admin_comment
    session.add(leave)
    session.commit()
    session.refresh(leave)
    return leave


@app.post("/leave/{leave_id}/reject", response_model=LeaveResponse, tags=["Leave Management"])
def reject_leave(
    leave_id: int,
    data: LeaveActionRequest,
    session: Session = Depends(get_session),
):
    """Admin rejects a leave request."""
    leave = session.get(LeaveRequest, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    leave.status = "Rejected"
    leave.admin_comment = data.admin_comment
    session.add(leave)
    session.commit()
    session.refresh(leave)
    return leave