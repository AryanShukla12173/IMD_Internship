from pydantic import BaseModel, Field
from enum import Enum
class userRole(Enum):
    USER = 'user'
    ADMIN = 'admin'
    
class UserRequest(BaseModel):
    full_name : str
    email : str
    password : str = Field(min_length=8)
    role: userRole = userRole.USER

class UserwithToken(UserRequest):
    access_token: str
    refresh_token: str

    
class UserLoginRequest(BaseModel):
    email: str
    password: str