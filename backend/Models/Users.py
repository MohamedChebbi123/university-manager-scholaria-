from sqlalchemy import String, Column, Integer, Date, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from Database.connection import Base

class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    country = Column(String(50), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    phone_number = Column(String(20), unique=True, nullable=True)
    age = Column(Integer, nullable=True)
    isverified = Column(String, nullable=True, default=True)
    password_hashed = Column(String(500), nullable=True)
    subject = Column(String(200), nullable=True)
    profile_picture = Column(String(500), nullable=True)
    joined_at = Column(Date, server_default=func.now())
    bio = Column(Text, nullable=True)
    role = Column(String, nullable=True)
    speciality = Column(String, nullable=True)
    department = Column(String(200), nullable=True)
    class_name = Column(String(200), nullable=True)

    # Relationships
    directed_department = relationship("Department", back_populates="director", uselist=False)
    subjects = relationship("Subjects", back_populates="professor")
    sessions = relationship("Session", back_populates="professor")
    absences = relationship("Absence", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")
    user_events = relationship("Event_association", back_populates="user")
    ratrapages = relationship("Ratrapage", back_populates="user")