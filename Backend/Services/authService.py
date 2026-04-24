from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import dotenv_values
from fastapi import HTTPException, status
import bcrypt

config = dotenv_values(".env.development")
SECRET_KEY = config["JWT_SECRET_KEY"]
ALGORITHM = config["JWT_ALGORITHM"]

def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    to_encode = {"sub": email, "id": user_id}
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
