from typing import List
from typing import Optional
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from Models.authSchema import userRole
from DB.connectDB import DB
Base = DB().Base

class User(Base):
    __tablename__ = "user_account"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default=userRole.USER.value)
    access_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

