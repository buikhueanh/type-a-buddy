from pydantic import BaseModel, Field
from typing import Optional

class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=6, max_length=128)

class UserOut(BaseModel):
    id: str
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)


class PasswordResetStartResponse(BaseModel):
    ok: bool = True
    code: Optional[str] = None


class PasswordResetConfirm(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6, max_length=128)


class OkResponse(BaseModel):
    ok: bool = True