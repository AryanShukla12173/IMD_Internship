from fastapi import FastAPI, status, Depends , HTTPException
from DB.connectDB import DB
from routers import authRouter
import Models
from typing import Annotated
app = FastAPI()
app.include_router(authRouter.router)

db = DB()
db.Base.metadata.create_all(bind=db.engine)
db_dependency = Annotated[DB, Depends(db.return_session)]

@app.get("/", status_code=status.HTTP_200_OK)
async def  user(user : None, db : db_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    
    return {"User": user}