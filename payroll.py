from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from database import User, Payroll, get_session

router = APIRouter(tags=["Payroll Management"])

# ── Schemas ────────────────────────────────────────────────────────────────────

class PayrollResponse(BaseModel):
    id: int
    user_id: int
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float

    class Config:
        from_attributes = True


class PayrollRequest(BaseModel):
    user_id: int
    basic_salary: float
    allowances: float = 0.0
    deductions: float = 0.0


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/payroll/{user_id}", response_model=PayrollResponse)
def get_employee_payroll(user_id: int, session: Session = Depends(get_session)):
    """Employee view — read-only salary structure."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    payroll = session.exec(
        select(Payroll).where(Payroll.user_id == user_id)
    ).first()

    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found for this user.")

    return payroll


@router.get("/payrolls", response_model=list[PayrollResponse])
def get_all_payrolls(session: Session = Depends(get_session)):
    """Admin view — all employee payroll records."""
    return session.exec(select(Payroll)).all()


@router.post("/payroll", response_model=PayrollResponse, status_code=201)
def create_or_update_payroll(data: PayrollRequest, session: Session = Depends(get_session)):
    """Admin action — set or update employee salary structure."""
    user = session.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    net_salary = data.basic_salary + data.allowances - data.deductions

    existing = session.exec(
        select(Payroll).where(Payroll.user_id == data.user_id)
    ).first()

    if existing:
        existing.basic_salary = data.basic_salary
        existing.allowances = data.allowances
        existing.deductions = data.deductions
        existing.net_salary = net_salary
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    payroll = Payroll(
        user_id=data.user_id,
        basic_salary=data.basic_salary,
        allowances=data.allowances,
        deductions=data.deductions,
        net_salary=net_salary
    )
    session.add(payroll)
    session.commit()
    session.refresh(payroll)
    return payroll