import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from core.security import verify_password, get_password_hash, create_access_token, get_current_user
from db.mongodb import db_manager
from schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    users_col = db_manager.users
    existing = users_col.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user_id = str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()
    
    hashed_pwd = get_password_hash(req.password)
    user_doc = {
        "_id": user_id,
        "id": user_id,
        "email": req.email.lower(),
        "password_hash": hashed_pwd,
        "full_name": req.full_name,
        "organization": req.organization,
        "created_at": now_str
    }
    
    users_col.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id, "email": req.email.lower(), "full_name": req.full_name})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(
            id=user_id,
            email=req.email.lower(),
            full_name=req.full_name,
            organization=req.organization,
            created_at=now_str
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    users_col = db_manager.users
    user = users_col.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    user_id = str(user.get("id") or user.get("_id"))
    token = create_access_token({"sub": user_id, "email": user.get("email"), "full_name": user.get("full_name")})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(
            id=user_id,
            email=user.get("email"),
            full_name=user.get("full_name"),
            organization=user.get("organization"),
            created_at=user.get("created_at", datetime.now(timezone.utc).isoformat())
        )
    )

@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    users_col = db_manager.users
    user = users_col.find_one({"_id": user_id})
    if not user:
        # Fallback to email lookup
        user = users_col.find_one({"email": current_user.get("email")})
        
    if not user:
        return UserProfile(
            id=user_id,
            email=current_user.get("email", "user@curamed.io"),
            full_name=current_user.get("full_name", "CuraMed User"),
            organization=None,
            created_at=datetime.now(timezone.utc).isoformat()
        )

    return UserProfile(
        id=str(user.get("id") or user.get("_id")),
        email=user.get("email"),
        full_name=user.get("full_name"),
        organization=user.get("organization"),
        created_at=user.get("created_at", datetime.now(timezone.utc).isoformat())
    )
