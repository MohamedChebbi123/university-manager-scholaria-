from sqlalchemy import String, Column, Integer, Date, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from Database.connection import Base

class Event_association(Base):
    __tablename__="assoc_event"
    
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    event_id = Column(Integer, ForeignKey("events.event_id"), primary_key=True)

    

    # Relationships to make it easier to access data
    user = relationship("Users", back_populates="user_events")
    event = relationship("Events", back_populates="event_attendees")