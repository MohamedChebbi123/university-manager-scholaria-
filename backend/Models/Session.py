from sqlalchemy import String, Column, Integer, ForeignKey,Time
from sqlalchemy.orm import relationship
from Database.connection import Base

class Session(Base):
    __tablename__="session"
    session_id=Column(Integer,primary_key=True,index=True)
    class_id=Column(Integer,ForeignKey("classes.id"),nullable=False)
    room_id=Column(Integer,ForeignKey("rooms.room_id"),nullable=False)
    professor_id=Column(Integer,ForeignKey("users.user_id"),nullable=False)
    subject_id=Column(Integer,ForeignKey("subjects.subject_id"),nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    day=Column(String,nullable=False)
    
    
    class_ = relationship("Classes", back_populates="sessions")
    room = relationship("Room", back_populates="sessions")
    professor = relationship("Users", back_populates="sessions")
    subject = relationship("Subjects", back_populates="sessions")
    absences = relationship("Absence", back_populates="session")
    