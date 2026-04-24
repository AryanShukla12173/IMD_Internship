from pydantic import BaseModel
from enum import Enum
class userRole(Enum):
    USER = 'user',
    ADMIN = 'admin'
    
class User(BaseModel):
    full_name : str
    user_name : str
    email : str
    password : str
    role: userRole = userRole.USER
    access_token : str
    refresh_token : str 
    