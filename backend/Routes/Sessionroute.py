from fastapi import APIRouter, Header ,Depends
from sqlalchemy.orm import Session
from Controllers.Sessioncontroller import add_session, fetch_professors,fetch_rooms_of_department, fetch_single_session_for_student,fetch_subjects,fetch_sessions,fetch_session_for_students,fetch_professor_sessions,fetch_sessions_for_class,fetch_sessions_for_class_for_director,fetch_single_session,fetch_single_session_for_admin,fetch_single_session_for_director
from Database.connection import connect_databse
from Schemas.roomscrd import roomscrd
from Schemas.sessionschema import sessionschema

router=APIRouter()


@router.get("/fetch_professors")
def fetch_professors_for_session(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_professors(authorization,db)


@router.get("/fetch_rooms/{id}")
def fetch_rooms_for_session(id:int,authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    return fetch_rooms_of_department(id,authorization,db)


@router.post("/add_session")
def add_session_route(
    data: sessionschema,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
    ):
    return add_session(data, authorization, db)

@router.get("/fetch_subject/{id}")
def fetch_subjects_for_session(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_subjects(id,authorization,db)

@router.get("/fetch_sessions/{id}")
def fetch_sessions_in_class(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_sessions(id,authorization,db)


@router.get("/fetch_session_for_students")
def fetch_session_for_student(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_session_for_students(authorization,db)

@router.get("/fetch_session_for_professor")
def fetch_professor_sessionss(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_professor_sessions(authorization,db)


@router.get("/fetch_class_session/{id}")
def fetch_class_sessions(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_sessions_for_class(id,authorization,db)

@router.get("/fetch_class_session_for_director/{id}")
def fetch_class_session_for_director(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_sessions_for_class_for_director(id,authorization,db)

@router.get("/get_signle_session_info_professor/{id}")
def get_signle_session_info_professor(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_single_session(id,authorization,db)

@router.get("/fetch_single_session_for_admin/{id}")
def fetch_single_session_for_admine(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_single_session_for_admin(id,authorization,db)

@router.get("/fetch_single_session_for_director/{id}")
def fetch_class_signle_session(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
 return fetch_single_session_for_director(id,authorization,db)


@router.get("/fetch_single_session_for_student/{id}")
def fetch_signle_class_session_student(id:int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return  fetch_single_session_for_student(id,authorization,db)
