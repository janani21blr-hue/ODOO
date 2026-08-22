from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from database import UserRole, User, LeaveRequest, create_db_and_tables, engine

from datetime import date


# ── Lifespan (creates tables on startup) ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="HRMS API", lifespan=lifespan)

# ── CORS (must be added before routes are hit by frontend) ────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # hackathon speed — change if frontend uses credentials
    allow_credentials=False,    # set True only if frontend fetch uses credentials: 'include'
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Dependency ─────────────────────────────────────────────────────────────────

def get_session():
    with Session(engine) as session:
        yield session


# ── Request / Response schemas ─────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    role: UserRole          # accepts only "employee" or "admin"

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user_id: int
    role: str


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.post("/signup", response_model=AuthResponse, status_code=201)
def signup(data: SignupRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(email=data.email, password=data.password, role=data.role)
    session.add(user)
    session.commit()
    session.refresh(user)

    return AuthResponse(user_id=user.id, role=user.role.value)


@app.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return AuthResponse(user_id=user.id, role=user.role.value)

    # ══════════════════════════════════════════════════════════════════════════════
# LEAVE MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

# ── Schemas ────────────────────────────────────────────────────────────────────

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


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.post("/leave/apply", response_model=LeaveResponse, status_code=201)
def apply_leave(data: LeaveApplyRequest, session: Session = Depends(get_session)):
    """Employee applies for leave."""
    # Verify the user exists
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


@app.get("/leave/{user_id}", response_model=list[LeaveResponse])
def get_leaves_for_user(user_id: int, session: Session = Depends(get_session)):
    """Employee view — all leave requests belonging to a specific user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    leaves = session.exec(
        select(LeaveRequest).where(LeaveRequest.user_id == user_id)
    ).all()
    return leaves


@app.get("/leaves", response_model=list[LeaveResponse])
def get_all_leaves(session: Session = Depends(get_session)):
    """Admin view — every leave request in the system."""
    return session.exec(select(LeaveRequest)).all()


@app.post("/leave/{leave_id}/approve", response_model=LeaveResponse)
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


@app.post("/leave/{leave_id}/reject", response_model=LeaveResponse)
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