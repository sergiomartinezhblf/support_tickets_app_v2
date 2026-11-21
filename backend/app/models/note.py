from sqlalchemy import Column,Integer,Text,DateTime,ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship 

from app.database import Base

class Note(Base):
    __tablename__="notes"

    id = Column(Integer,primary_key=True,index=True)
    content = Column(Text,nullable=False)
    created_at = Column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    ticket_id = Column(Integer,ForeignKey("tickets.id"),nullable=False)

    ticket = relationship("Ticket",back_populates="notes")