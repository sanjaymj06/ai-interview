from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middleware.auth import get_current_user
from app.models.user import (
    ForgotPasswordRequest,
    ProfileUpdate,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.utils.constants import ERROR_MESSAGES, SUCCESS_MESSAGES
from app.utils.helpers import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_reset_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        role=user.get("role", "user"),
        status=user.get("status", "active"),
        avatar_url=user.get("avatar_url"),
        created_at=user.get("created_at", datetime.utcnow()),
        updated_at=user.get("updated_at", datetime.utcnow()),
    )


def _create_tokens(user_id: str, role: str) -> Token:
    token_data = {"sub": user_id, "role": role}
    return Token(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES["EMAIL_EXISTS"],
        )
    now = datetime.utcnow()
    user_doc = {
        "email": body.email,
        "full_name": body.full_name,
        "hashed_password": hash_password(body.password),
        "role": "user",
        "status": "active",
        "avatar_url": None,
        "reset_token": None,
        "reset_token_expiry": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    tokens = _create_tokens(user_doc["_id"], user_doc["role"])
    return {
        "message": SUCCESS_MESSAGES["USER_CREATED"],
        "user": _user_response(user_doc).model_dump(),
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": tokens.token_type,
    }


@router.post("/login", response_model=dict)
async def login(body: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES["INVALID_CREDENTIALS"],
        )
    if user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active",
        )
    user_id = str(user["_id"])
    tokens = _create_tokens(user_id, user.get("role", "user"))
    return {
        "message": SUCCESS_MESSAGES["LOGIN_SUCCESS"],
        "user": _user_response(user).model_dump(),
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": tokens.token_type,
    }


@router.post("/forgot-password", response_model=dict)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({"email": body.email})
    if not user:
        return {"message": SUCCESS_MESSAGES["PASSWORD_RESET_EMAIL"]}
    token, expiry = generate_reset_token()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": token, "reset_token_expiry": expiry, "updated_at": datetime.utcnow()}},
    )
    return {
        "message": SUCCESS_MESSAGES["PASSWORD_RESET_EMAIL"],
        "reset_token": token,
    }


@router.post("/reset-password", response_model=dict)
async def reset_password(body: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await db.users.find_one({"reset_token": body.token})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES["TOKEN_INVALID"],
        )
    expiry = user.get("reset_token_expiry")
    if expiry and expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES["TOKEN_EXPIRED"],
        )
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "hashed_password": hash_password(body.new_password),
            "reset_token": None,
            "reset_token_expiry": None,
            "updated_at": datetime.utcnow(),
        }},
    )
    return {"message": SUCCESS_MESSAGES["PASSWORD_RESET"]}


@router.get("/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": _user_response(current_user).model_dump()}


@router.put("/profile", response_model=dict)
async def update_profile(
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    update_fields = {}
    if body.full_name is not None:
        update_fields["full_name"] = body.full_name.strip().title()
    if body.avatar_url is not None:
        update_fields["avatar_url"] = body.avatar_url
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    update_fields["updated_at"] = datetime.utcnow()
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_fields})
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return {
        "message": SUCCESS_MESSAGES["PROFILE_UPDATED"],
        "user": _user_response(updated_user).model_dump(),
    }


@router.post("/refresh", response_model=dict)
async def refresh_token(refresh_token: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES["TOKEN_INVALID"],
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES["TOKEN_INVALID"],
        )
    user = await db.users.find_one({"_id": user_id})
    if not user or user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    tokens = _create_tokens(user_id, user.get("role", "user"))
    return {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": tokens.token_type,
    }
