from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey 
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class Ticket(Base):
    __tablename__="tickets"

    id = Column(Integer,primary_key=True,index=True)
    title = Column(String(200),nullable=False)
    description = Column(Text,nullable=False)
    status = Column(String(50),nullable=False,default="open")
    created_at = Column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    closed_at = Column(DateTime(timezone=True),nullable=True)
    owner_id = Column(Integer,ForeignKey("users.id"),nullable=False)

    owner = relationship("User", back_populates="tickets")
    notes = relationship("Note", back_populates="ticket")

