from fastapi import APIRouter, Depends, Form, Header, UploadFile
from Schemas.absenceshcema import absenceschema
from sqlalchemy.orm import Session
from Database.connection import connect_databse
from Controllers.absence_controller import assign_absence, fetch_absence_per_class_session, fetch_absence_per_class_session_admin, fetch_absence_per_class_session_director,fetch_absence_in_session,demand_absence,fetch_requests,accept_demand,reject_demand,fetch_student_own_absences_in_session,fetch_all_student_absences_by_subject,fetch_professor_subject_absences,fetch_all_absences_by_subject_admin,fetch_all_absences_by_subject_director


router=APIRouter()


@router.post("/assign_absence")
async def assign_absence_professor(data:absenceschema,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return await assign_absence(data,authorization,db)

@router.get("/absences/class/{class_id}/session/{session_id}")
def get_absences_for_session(
    class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    return fetch_absence_per_class_session(class_id, session_id, authorization, db)

@router.get("/absences/class_for_admin/{class_id}/session/{session_id}")
def get_absence_for_session_admin(class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    return fetch_absence_per_class_session_admin(
    class_id,
    session_id,
    authorization,
    db
)

@router.get("/absences/class_for_director/{class_id}/session/{session_id}")
def fetch_absence_per_class_session_for_director(class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    return fetch_absence_per_class_session_director(
       class_id,session_id,authorization,db)
    
    
@router.get("/absences/class_for_student/{class_id}/session/{session_id}")
def fetch_student_absence(class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
     return   fetch_absence_in_session(class_id,
    session_id,
    authorization,
    db)
     
     
@router.post("/demand_absence")
def demand_revoke_absence(reason: str=Form(...),
    document :UploadFile=Form(...),
    absence_id: int=Form(...),
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    
    return demand_absence(reason,document,absence_id,authorization,db)
    
@router.get("/fetch_requests")
def fetch_requests_for_director(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_requests(authorization,db)

@router.post("/accept_absence/{demande_id}")
async def accept_student_absence(demande_id: int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return await accept_demand(demande_id,authorization,db)

@router.post("/reject_absence/{demande_id}")
async def reject_student_absence(demande_id: int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return await reject_demand(demande_id,authorization,db)

@router.get("/student_absence_history/{session_id}")
def get_student_absence_history(session_id: int, authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_student_own_absences_in_session(session_id, authorization,db)

@router.get("/student_all_absences")
def get_student_all_absences(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_all_student_absences_by_subject(authorization,db)

@router.get("/professor_subject_absences")
def get_professor_subject_absences(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_professor_subject_absences(authorization,db)

@router.get("/admin_all_absences_by_subject")
def get_admin_all_absences_by_subject(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_all_absences_by_subject_admin(authorization,db)

@router.get("/director_all_absences_by_subject")
def get_director_all_absences_by_subject(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_all_absences_by_subject_director(authorization,db)

