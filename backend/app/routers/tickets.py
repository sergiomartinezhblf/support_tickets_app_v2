from fastapi import APIRouter,Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_bd
from app.models.ticket import Ticket
from app.models.user import User
from app.models.note import Note
from app.schemas.ticket import TicketCreate,TicketResponse,TicketUpdate
from app.schemas.note import NoteCreate,NoteResponse
from app.utils.security import get_current_user,require_admin
from app.services.ticket_service import (close_ticket as close_ticket_service,update_ticket as update_ticket_service,create_ticket as create_ticket_service)
from app.services.note_service import create_note as create_note_service
from app.utils.ticket_helpers import get_ticket_or_404
from datetime import datetime,timezone

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


@router.post("/", response_model=TicketResponse)
def create_ticket(ticket:TicketCreate,db:Session=Depends(get_bd),current_user:User=Depends(get_current_user)):

    return create_ticket_service(db,ticket,current_user.id)

@router.get("/",response_model=list[TicketResponse])
def get_tickets(db:Session=Depends(get_bd),current_user:User=Depends(get_current_user)):
    tickets = db.query(Ticket).filter(Ticket.owner_id==current_user.id).all()

    return tickets

@router.get("/admin/all",response_model=list[TicketResponse])
def get_all_tickets(db:Session=Depends(get_bd),current_user:User=Depends(require_admin)):
    tickets = db.query(Ticket).all()

    return tickets

@router.get("/admin/{ticket_id}",response_model=TicketResponse)
def get_ticket_admin(ticket_id:int,db:Session=Depends(get_bd),current_user:User=Depends(require_admin)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404,detail="ticket not found")
    
    return ticket

@router.patch("/admin/{ticket_id}",response_model=TicketResponse)
def update_ticket_admin(ticket_id:int,ticket_data:TicketUpdate,db:Session=Depends(get_bd),current_user:User=Depends(require_admin)):
    ticket = get_ticket_or_404(db,ticket_id)

    return update_ticket_service(db,ticket,ticket_data) 

@router.get("/{ticket_id}",response_model=TicketResponse)
def get_ticket(ticket_id:int,db:Session=Depends(get_bd),current_user:User=Depends(get_current_user)):
    ticket = get_ticket_or_404(db,ticket_id)

    if ticket.owner_id != current_user.id:
        raise HTTPException(status_code=403,detail="You don't have permission to access this ticket")
    
    return ticket 

@router.patch("/{ticket_id}",response_model=TicketResponse)
def update_ticket(ticket_id:int,ticket_data:TicketUpdate,db:Session=Depends(get_bd),current_user: User=Depends(get_current_user)):
    ticket = db.query(Ticket).filter(Ticket.id==ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404,detail="Ticket not found")

    if ticket.owner_id != current_user.id:
        raise HTTPException(status_code=403,detail="You don't have permission to update this ticket")

    return update_ticket_service(db,ticket,ticket_data)
    
@router.patch("/{ticket_id}/close",response_model=TicketResponse)
def close_ticket(ticket_id:int,db:Session=Depends(get_bd),current_user:User=Depends(get_current_user)):
    ticket = get_ticket_or_404(db,ticket_id)

    if ticket.owner_id != current_user.id:
        raise HTTPException(status_code=403,detail="You don't have permission to close this ticket")

    return close_ticket_service(db,ticket)


@router.post("/{ticket_id}/notes",response_model=NoteResponse)
def create_note(ticket_id:int,note:NoteCreate,db:Session=Depends(get_bd),current_user:User=Depends(get_current_user)):
    
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404,detail="Ticket not found")

    if ticket.owner_id != current_user.id:
        raise HTTPException(status_code=403,detail="You don't have permission to add a note to this ticket")

    return create_note_service(db,ticket,note)

@router.get("/{ticket_id}/notes",response_model=list[NoteResponse])
def get_ticket_notes(ticket_id:int,db:Session=Depends(get_bd),current_user:User=Depends(get_current_user)):

    ticket = db.query(Ticket).filter(Ticket.id==ticket_id).first()

    if not ticket: 
        raise HTTPException(status_code=404,detail="Ticket not found")
    
    if ticket.owner_id != current_user.id:
        raise HTTPException(status_code=403,detail="You don't have permission to view the notes of this ticket")

    notes = ticket.notes 

    return notes

@router.patch("/admin/{ticket_id}/close",response_model=TicketResponse)
def close_ticket_admin(ticket_id:int,db:Session=Depends(get_bd),current_user:User=Depends(require_admin)):
    ticket = get_ticket_or_404(db,ticket_id)

    return close_ticket_service(db,ticket) 



    

    

        

