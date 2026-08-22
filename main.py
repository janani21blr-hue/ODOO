from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from database import UserRole, User, create_db_and_tables, engine


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