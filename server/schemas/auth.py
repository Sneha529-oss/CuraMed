from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    organization: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    organization: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
