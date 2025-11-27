from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from Database.connection import connect_databse
from Controllers.stats_controller import (
    fetch_sessions_for_department, 
    delete_session,
    get_class_statistics,
    get_department_statistics,
    get_all_departments_statistics
)

router = APIRouter()


@router.get("/fetch_sessions_by_department/{department_id}")
def get_sessions_by_department(department_id: int,authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return fetch_sessions_for_department(department_id,authorization, db)


@router.delete("/delete_session/{session_id}")
def delete_session_route(session_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return delete_session(session_id, authorization, db)


@router.get("/class/{class_id}")
def get_class_stats(class_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return get_class_statistics(class_id, authorization, db)


@router.get("/department/{department_id}")
def get_department_stats(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return get_department_statistics(department_id, authorization, db)


@router.get("/departments/all")
def get_all_departments_stats(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return get_all_departments_statistics(authorization, db)
