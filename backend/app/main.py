from fastapi import FastAPI 

from app.database import Base,engine
from app.models.user import User
from app.models.ticket import Ticket
from app.models.note import Note
from app.routers.auth import router as auth_router
from app.routers.tickets import router as ticket_router

from fastapi.middleware.cors import CORSMiddleware

print("creando tablas")
Base.metadata.create_all(bind=engine)
print("tablas creadas")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:4173","https://support-tickets-app-v2.vercel.app","https://support-tickets-app-v2-git-main-sergiomartinezhblfs-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(ticket_router)

@app.get("/")
def home():
    return {"message":"Ticket System V2"}