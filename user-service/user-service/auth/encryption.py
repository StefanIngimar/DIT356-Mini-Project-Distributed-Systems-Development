import bcrypt


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(
        password=plain_password.encode(), salt=bcrypt.gensalt()
    ).decode("utf-8")


def is_correct_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        password=plain_password.encode(), hashed_password=hashed_password.encode()
    )
