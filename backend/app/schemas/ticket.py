from pydantic import BaseModel,ConfigDict
from datetime import datetime

class TicketCreate(BaseModel):
    title: str
    description: str 

class TicketResponse(BaseModel):
    id : int 
    title : str 
    description : str 
    status: str 
    owner_id: int
    closed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

    