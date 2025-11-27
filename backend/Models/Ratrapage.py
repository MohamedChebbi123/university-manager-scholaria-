from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from Database.connection import Base

class Ratrapage(Base):
    __tablename__ = "ratrapage"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=False)
    department_id = Column(Integer, ForeignKey("department.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    
    date = Column(Date, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    subject = Column(String(200), nullable=True)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("Users", back_populates="ratrapages")
    class_ = relationship("Classes", back_populates="ratrapages")
    room = relationship("Room", back_populates="ratrapages")
    department = relationship("Department", back_populates="ratrapages")
    subject = relationship("Subjects", back_populates="ratrapages")
