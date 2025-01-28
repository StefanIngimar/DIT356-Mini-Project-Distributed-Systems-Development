from typing import Any, Dict, Tuple, TypeAlias

import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

JwtValidityReason: TypeAlias = str


def generate_jwt(payload: Dict[str, Any], secret: str, algorithm: str) -> str:
    return jwt.encode(payload, secret, algorithm)


def is_jwt_valid(
    token: str, secret: str, algorithm: str
) -> Tuple[bool, JwtValidityReason]:
    try:
        jwt.decode(
            jwt=token,
            key=secret,
            algorithms=algorithm,
            options={"require": ["exp", "iat"]},
        )
    except (ExpiredSignatureError, InvalidTokenError) as e:
        return False, str(e)
    return True, ""
