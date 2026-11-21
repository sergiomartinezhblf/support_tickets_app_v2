from datetime import datetime 
from pydantic import BaseModel, ConfigDict

class NoteCreate(BaseModel):
    content: str 

class NoteResponse(BaseModel):
    id: int
    content: str 
    created_at: datetime 
    ticket_id: int 

    model_config = ConfigDict(from_attributes=True)