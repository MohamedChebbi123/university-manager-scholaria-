from sqlalchemy import Column, Date, ForeignKey, String, Integer, func, Text
from Database.connection import Base
from sqlalchemy.orm import relationship

class Department(Base):
    __tablename__ = "department"

    id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(50), nullable=False)
    created_at = Column(Date, server_default=func.now())
    description = Column(Text, nullable=False)
    profile_picture = Column(String(500), nullable=True)

    classes = relationship("Classes", back_populates="department", cascade="all, delete-orphan")
    
    rooms = relationship("Room", back_populates="department", cascade="all, delete-orphan")
    
    director_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    director = relationship("Users", back_populates="directed_department", uselist=False)
    subjects = relationship("Subjects", back_populates="department", cascade="all, delete-orphan")
    ratrapages = relationship("Ratrapage", back_populates="department", cascade="all, delete-orphan")

