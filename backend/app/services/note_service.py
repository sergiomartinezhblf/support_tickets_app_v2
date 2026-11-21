from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.note import Note 
from app.models.ticket import Ticket 
from app.schemas.note import NoteCreate

def create_note(db:Session,ticket:Ticket,note_data:NoteCreate):
    if ticket.status == "closed":
        raise HTTPException(status_code=400,detail="Cannot add notes to a closed ticket")
    
    new_note= Note(content=note_data.content,ticket_id=ticket.id)

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note