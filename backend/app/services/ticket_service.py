from sqlalchemy.orm import Session
from app.models.ticket import Ticket

from fastapi import HTTPException
from datetime import datetime

from app.schemas.ticket import TicketCreate,TicketUpdate

def create_ticket(db:Session,ticket_data:TicketCreate,owner_id:int):
    new_ticket = Ticket(title=ticket_data.title,description=ticket_data.description,owner_id=owner_id)

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket

def close_ticket(db:Session,ticket:Ticket):
    if ticket.status == "closed":
        raise HTTPException(status_code=400,detail="Ticket is alredy closed")

    ticket.status = "closed"
    ticket.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket

def update_ticket(db:Session,ticket:Ticket,ticket_data:TicketUpdate):
    if ticket_data.title is not None:
        ticket.title = ticket_data.title
    
    if ticket_data.description is not None:
        ticket.description = ticket_data.description

    db.commit()
    db.refresh(ticket)

    return ticket 