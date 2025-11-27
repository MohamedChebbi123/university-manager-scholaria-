from sqlalchemy import String, Column, Integer, ForeignKey,Time,Boolean
from sqlalchemy.orm import relationship
from Database.connection import Base

class Demande(Base):
    __tablename__="demande"
    
    demande_id=Column(Integer,primary_key=True)
    reason=Column(String,nullable=False)
    document=Column(String,nullable=False)
    absence_id = Column(Integer, ForeignKey("absence.id"), nullable=False)
    is_accepted=Column(Boolean,nullable=False,default=False)
    
    
    absence = relationship("Absence", back_populates="demandes")
    