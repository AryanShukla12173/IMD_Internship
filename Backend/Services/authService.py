from jose import jwt, JWTError
from datetime import datetime, timedelta , timezone
from dotenv import dotenv_values
from fastapi import HTTPException, status, Depends
from fastapi.security import APIKeyCookie
import bcrypt
from DB.connectDB import DB
from Services.userService import userService

config = dotenv_values(".env.development")
SECRET_KEY = config["JWT_SECRET_KEY"]
ALGORITHM = config["JWT_ALGORITHM"]

cookie_auth = APIKeyCookie(name="access_token", auto_error=False)

class AuthService:
    def __init__(self) -> None:
        self.session = DB().return_session
    @staticmethod
    def create_token(user_id : int , email : str, expires_delta : timedelta):
        try :
            expire = datetime.now(tz=timezone.utc) + expires_delta
            to_encode  = {
                "user_id" : user_id,
                "email" : email,
                "exp" : expire
            }
            
            return jwt.encode(to_encode,key = SECRET_KEY, algorithm=ALGORITHM) # type: ignore
        except JWTError as e :
            print(f"Error in creating Token : {str(e)}")
    @staticmethod
    def verifyPass(plain_pass: str, hashed_pass: str)  -> bool : # pyright: ignore[reportReturnType]
        try:
           return bcrypt.checkpw(plain_pass.encode('utf-8'), hashed_pass.encode('utf-8'))
        except Exception as e:
            print(f"Error in Matching Pass : {str(e)}")
            return False

    @staticmethod
    def get_current_user(token: str = Depends(cookie_auth), user_service: userService = Depends(userService)):
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Not authenticated"
            )
        
        # Clean 'Bearer ' prefix if it was included in the cookie
        token_clean = token.replace("Bearer ", "") if token.startswith("Bearer ") else token

        try:
            payload = jwt.decode(token_clean, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
            email = payload.get("email")
            if email is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        
        user = user_service.find_user(email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        return user
        
    
        
            