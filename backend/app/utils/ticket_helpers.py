from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.ticket import Ticket

def get_ticket_or_404(db:Session,ticket_id:int):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404,detail="Ticket not found")
    
    return ticket 