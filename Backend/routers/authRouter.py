from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from starlette import status
from Models import authSchema
from DB.connectDB import DB
from DB.Tables import authTable
import bcrypt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from Services.authService import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

db = DB()
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")
db_dependency = Annotated[Session, Depends(db.return_session)]     

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(db : db_dependency, create_user_request: authSchema.UserRequest):
    try:
        # Passlib is broken with bcrypt>=4.0.0, so we use bcrypt directly here
        hashed_password = bcrypt.hashpw(create_user_request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = authTable.User(
            full_name=create_user_request.full_name,
            email=create_user_request.email,
            password=hashed_password,
            role=create_user_request.role.value
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_for_access_token(
    response: Response, 
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    db: db_dependency
):
    # FastAPI's OAuth2PasswordRequestForm uses "username" for the login identifier.
    # In your app, the email is effectively the username.
    user = db.query(authTable.User).filter(authTable.User.email == form_data.username).first()
    
    # 1. Verify User Credentials
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Create Access Token (20 minutes)
    access_token_expires = timedelta(minutes=20)
    access_token = create_access_token(user.email, user.id, access_token_expires)
    
    # 3. Create Refresh Token (e.g. 7 days)
    refresh_token_expires = timedelta(days=7)
    refresh_token = create_access_token(user.email, user.id, refresh_token_expires)

    # 4. Handle Storing Tokens Safely
    # The safest way for a web client is to store it in an HttpOnly cookie so JS can't access it (to prevent XSS).
    response.set_cookie(
        key="access_token", 
        value=f"Bearer {access_token}", 
        httponly=True, 
        max_age=20*60, # 20 minutes in seconds
        samesite="lax",
        secure=False  # Set to True when using HTTPS in production!
    )
    
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True,
        max_age=7*24*60*60, # 7 days
        samesite="lax",
        secure=False
    )
    
    # Standard OAuth2 response for Swagger UI
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

