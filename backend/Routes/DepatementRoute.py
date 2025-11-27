from requests import Session
from Controllers.DepartmentController import add_departement, add_professor_subject_to_class,fetch_department, fetch_professors,fetch_single_department,add_director_to_department, fetch_subjects_per_department,fetch_department_director,fetch_students_professors,fetch_students_professors,fetch_students_for_director,fetch_students_for_admin,delete_department,fetch_subjects_for_director_and_admin,fetch_department_director_info,delete_director
from fastapi import APIRouter, Body, Depends, File, Form, Header, Query, UploadFile
from Database.connection import connect_databse
from Schemas.director import directorcredentials
from Schemas.subjectshcma import subjectschema


router=APIRouter()


@router.post("/add_a_department")
def add_department_as_an_admin(dept_name:str=Form(...),
    description:str=Form(...),
    profile_picture: UploadFile = Form(...),
    authorization: str | None = Header(None),
    db:Session=Depends(connect_databse)):
    
    return add_departement(dept_name,description,profile_picture,authorization,db)


@router.get("/fetch_all_departments")
def fetch_department_as_admin(authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    return fetch_department(authorization,db)

@router.get("/fetch_single_department/{id}")
def fetch_single_department_as_admin(id:int,authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    return fetch_single_department(id,authorization,db)


@router.post("/add_director")
def add_director_to_department_as_an_admin(
    department_id: int = Query(...),
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse),
    data: directorcredentials = Body(...)):
    return add_director_to_department(
        data,
        authorization,
        department_id,
        db
    )
    
@router.post("/add_csubject_to_department")
def add_professor_subject_to_class_as_admin(data:subjectschema,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return add_professor_subject_to_class(data,authorization,db)

@router.get("/fetch_professors")
def fetch_professors_as_admin(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_professors(authorization,db)

@router.get("/fetch_classes_for_subject/{department_id}")
def fetch_subjects_per_department_as_admin(department_id:int,authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_subjects_per_department(department_id,authorization,db)

@router.get("/fetch_department_for_director")
def fetch_director_department(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_department_director(authorization,db)

@router.get("/fetch_students_for_professor")
def fetch_students_for_professor(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_students_professors(authorization, db)

@router.get("/fetch_student_for_director")
def fetch_student_for_director(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_students_for_director(authorization,db)

@router.get("/fetch_student_for_admin")
def fetch_student_for_admin(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return fetch_students_for_admin(authorization ,db)

@router.delete("/delete_department/{department_id}")
def delete_department_as_admin(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return delete_department(department_id, authorization, db)

@router.get("/fetch_subjects_with_professors/{department_id}")
def fetch_subjects_with_professors(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_subjects_for_director_and_admin(department_id, authorization, db)

@router.get("/fetch_director_department_info/{department_id}")
def fetch_director_department_info_route(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_department_director_info(department_id, authorization, db)

@router.delete("/delete_director/{department_id}")
def delete_director_route(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return delete_director(department_id, authorization, db)