from sqlalchemy import String, Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from Database.connection import Base

class Subjects(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String, nullable=False)
    multiplier = Column(Integer, nullable=False)

    professor_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    department_id = Column(Integer, ForeignKey("department.id"), nullable=False)

    # Relationships
    professor = relationship("Users", back_populates="subjects")
    department = relationship("Department", back_populates="subjects")
    # Back-populate sessions linked to this subject
    sessions = relationship("Session", back_populates="subject")
    ratrapages = relationship("Ratrapage", back_populates="subject")