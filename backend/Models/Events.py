from sqlalchemy import Column, Integer, String, Text, DateTime, Date, func
from sqlalchemy.orm import relationship
from Database.connection import Base

class Events(Base):
    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)

    event_name = Column(String, unique=True, nullable=False)

    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    ends_at = Column(Date)

    details = Column(Text)
    event_type = Column(String)
    event_attendees = relationship("Event_association", back_populates="event")