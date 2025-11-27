from sqlalchemy import String, Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from Database.connection import Base

class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(Integer, primary_key=True, index=True)
    room_name = Column(String, nullable=False)
    
    department_id = Column(Integer, ForeignKey("department.id"), nullable=False)
    
    type=Column(String,nullable=False)
    
    department = relationship("Department", back_populates="rooms")
    sessions = relationship("Session", back_populates="room")
    ratrapages = relationship("Ratrapage", back_populates="room")
