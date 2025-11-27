from sqlalchemy import Boolean, Column, Integer, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from Database.connection import Base

class Absence(Base):
    __tablename__ = "absence"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("session.session_id"), nullable=True)
    date = Column(Date, server_default=func.now())
    is_absent = Column(Boolean, nullable=False, default=True)
    user = relationship("Users", back_populates="absences")
    class_ = relationship("Classes", back_populates="absences")
    session = relationship("Session", back_populates="absences")
    demandes = relationship("Demande", back_populates="absence")