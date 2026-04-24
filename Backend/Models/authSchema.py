from pydantic import BaseModel, Field
from enum import Enum
class userRole(Enum):
    USER = 'user'
    ADMIN = 'admin'
    
class UserRequest(BaseModel):
    full_name : str
    email : str
    password : str = Field(max_length=72)
    role: userRole = userRole.USER
    
class Token(BaseModel):
    access_token: str
    token_type : str
    