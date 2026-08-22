from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from database import User, UserProfile, get_session

router = APIRouter(tags=["Profile Management"])

# ── Schemas ────────────────────────────────────────────────────────────────────

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    profile_pic_url: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    profile_pic_url: Optional[str] = None


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/profile/{user_id}", response_model=ProfileResponse)
def get_user_profile(user_id: int, session: Session = Depends(get_session)):
    """View user profile details."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user_id)
    ).first()

    if not profile:
        profile = UserProfile(user_id=user_id, full_name=user.email.split('@')[0])
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return profile


@router.put("/profile/{user_id}", response_model=ProfileResponse)
def update_user_profile(user_id: int, data: ProfileUpdateRequest, session: Session = Depends(get_session)):
    """Edit user profile details."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user_id)
    ).first()

    if not profile:
        profile = UserProfile(user_id=user_id)

    if data.full_name is not None:
        profile.full_name = data.full_name
    if data.phone is not None:
        profile.phone = data.phone
    if data.address is not None:
        profile.address = data.address
    if data.job_title is not None:
        profile.job_title = data.job_title
    if data.department is not None:
        profile.department = data.department
    if data.profile_pic_url is not None:
        profile.profile_pic_url = data.profile_pic_url

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile