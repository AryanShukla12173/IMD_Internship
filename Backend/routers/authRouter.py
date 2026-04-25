import bcrypt
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import APIKeyCookie
from jose import jwt

from DB.models import authSchema
from DB.Tables import authTable
from Services.authService import ALGORITHM, AuthService, SECRET_KEY
from Services.userService import userService

router = APIRouter(prefix="/auth", tags=["Authentication"])

cookie_auth = APIKeyCookie(name="access_token", auto_error=False)

user_service_dependency = Annotated[userService, Depends(userService)]     

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(user_service : user_service_dependency, create_user_request: authSchema.UserRequest):
    try:
        # Passlib is broken with bcrypt>=4.0.0, so we use bcrypt directly here
        hashed_password = bcrypt.hashpw(create_user_request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = authTable.User(
            full_name=create_user_request.full_name,
            email=create_user_request.email,
            password=hashed_password,
            role=create_user_request.role.value
        )
        
        user_service.create_user(new_user)
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_for_access_token(
    response: Response, 
    login_data: authSchema.UserLoginRequest, 
    user_service: user_service_dependency
):
    try:
        user = user_service.find_user(login_data.email)
        
        # 1. Verify User Credentials
        if not user or not AuthService.verifyPass(login_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 2. Create Access Token (20 minutes)
        access_token_expires = timedelta(minutes=20)
        access_token = AuthService.create_token(user.id, user.email, access_token_expires)
        
        # 3. Create Refresh Token (e.g. 7 days)
        refresh_token_expires = timedelta(days=7)
        refresh_token = AuthService.create_token(user.id, user.email, refresh_token_expires)

        # Store tokens in DB via user_service
        user.access_token = access_token
        user.refresh_token = refresh_token
        user_service.update_user(user)

        # 4. Handle Storing Tokens Safely
        # The safest way for a web client is to store it in an HttpOnly cookie so JS can't access it (to prevent XSS).
        
        response.set_cookie(
            key="access_token", 
            value=f"{access_token}", 
            httponly=True, 
            max_age=20*60, # 20 minutes in seconds
            samesite="lax",
            secure=True  
        )
        
        response.set_cookie(
            key="refresh_token", 
            value=refresh_token,  # type: ignore
            httponly=True,
            max_age=7*24*60*60, # 7 days
            samesite="lax",
            secure=True
        )
        
        # We return a generic success message instead of the raw tokens in the JSON body.
        # The tokens are now STRICTLY stored in the secure HttpOnly cookies.
        return {
            "message": "Successfully logged in",
            "token_type": "bearer"
        }
    except HTTPException:
        # Re-raise HTTP exceptions directly
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    request: Request,
    response: Response,
    user_service: user_service_dependency
):
    try:
        # Try to grab the token from cookies or Headers
        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if token:
            try:
                # Strip "Bearer " if it's in the cookie
                token_clean = token.replace("Bearer ", "")
                payload = jwt.decode(token_clean, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
                email = payload.get("email")
                
                # Nullify tokens from the database if user is found
                if email:
                    user = user_service.find_user(email)
                    if user:
                        user.access_token = None
                        user.refresh_token = None
                        user_service.update_user(user)
            except Exception:
                pass  # Even if token is expired/invalid, we still want to clear the cookies
        
        # Clear both cookies from the browser
        response.delete_cookie("access_token", samesite="lax")
        response.delete_cookie("refresh_token", samesite="lax")
        
        return {"message": "Successfully logged out"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

