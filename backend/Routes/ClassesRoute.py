from fastapi import APIRouter, Depends, File, Form,Header, UploadFile
from sqlalchemy.orm import Session
from Database.connection import connect_databse
from Controllers.ClassesController import add_class_to_department, fetch_class_info, fetch_classes,fetch_student_class,fetch_professor_classes,fetch_class_info_pr,fetch_classes_dr,fetch_class_info_dir,fetch_users_for_session
 
router=APIRouter()

@router.post("/add_class")
def add_class_to_department_as_admin(name:str =Form(...),
    capacity : int =Form(...),
    profile_picture: UploadFile = File(...),
    description : str = Form(...),
    department_id:int=Form(...),
    authorization: str | None = Header(None),
    db:Session=Depends(connect_databse)):
    
    return add_class_to_department(name,capacity,profile_picture,description,department_id,authorization,db)


@router.get("/fetch_classes/{id}")
def fetch_classes_as_admin(department_id: int,authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    return fetch_classes(department_id,authorization,db)

@router.get("/fetch_class/{class_id}")
def fetch_class_as_admin(class_id: int,
    authorization: str | None = Header(None),
    db:Session=Depends(connect_databse)):
    return fetch_class_info(class_id,authorization,db)


@router.get("/fetch_classes_for_student")
def fetch_classes_for_student( authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    return fetch_student_class( authorization,db)


@router.get("/fetch_professor_classes")
def fetch_professor_classess(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_professor_classes(authorization,db)


@router.get("/fetch_classes_info_for_pr/{class_id}")
def fetch_class_info_professor(class_id: int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_class_info_pr(class_id,authorization,db)


@router.get("/fetch_classes_for_director")
def fetch_classes_for_director(authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    return fetch_classes_dr(authorization,db)

@router.get("/fetch_class_for_director/{class_id}")
def fetch_classe_for_director(class_id: int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_class_info_dir(class_id,authorization,db)

@router.get("/get_students_for_session/{class_id}")
def fetch_stduents_sessions(class_id: int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_users_for_session(class_id,authorization,db)