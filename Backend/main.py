from fastapi import FastAPI, status, Depends , HTTPException
from DB.connectDB import DB as Database
from routers import authRouter
from typing import Annotated
from contextlib import asynccontextmanager
from Services.authService import AuthService
from DB.Tables.authTable import User

@asynccontextmanager
async def lifespan(app : FastAPI):
    # Initialise DB
    db = Database()
    db.Base.metadata.create_all(bind=db.engine)
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(authRouter.router)

@app.get("/me", status_code=status.HTTP_200_OK)
async def get_me(current_user: Annotated[User, Depends(AuthService.get_current_user)]):
    """
    Example protected route using the `get_current_user` dependency from AuthService.
    """
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name
    }