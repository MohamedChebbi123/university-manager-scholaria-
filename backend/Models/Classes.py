from sqlalchemy import String, Integer, Column, Text, ForeignKey
from sqlalchemy.orm import relationship
from Database.connection import Base

class Classes(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    capacity = Column(Integer, nullable=False)
    profile_picture = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    department_id = Column(Integer, ForeignKey("department.id"), nullable=False)

    # Relationships
    department = relationship("Department", back_populates="classes")
    sessions = relationship("Session", back_populates="class_")
    absences = relationship("Absence", back_populates="class_")
    ratrapages = relationship("Ratrapage", back_populates="class_")
