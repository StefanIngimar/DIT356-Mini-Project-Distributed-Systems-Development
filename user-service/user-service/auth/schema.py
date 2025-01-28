from pydantic import BaseModel


class JwtToken(BaseModel):
    token: str


class JwtValidationResult(BaseModel):
    is_valid: bool
    reason: str
