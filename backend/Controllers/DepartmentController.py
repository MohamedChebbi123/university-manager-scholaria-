from fastapi import Depends, File, Form, HTTPException, Header, Query, UploadFile,status
from Database.connection import connect_databse
from sqlalchemy.orm import Session, joinedload
from Models.Subjects import Subjects
from Models.Users import Users
from Models.Department import Department
from Schemas.subjectshcma import subjectschema
from Utils.jwt_handler import verify_token
from Utils.cloudinary_uploader import upload_user_profile_image
from Schemas.director import directorcredentials
from Utils.hasher import hash_password
def add_departement(
    dept_name:str=Form(...),
    description:str=Form(...),
    profile_picture: UploadFile = Form(...),
    authorization: str | None = Header(None),
    db:Session=Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    found_user=db.query(Users).filter(Users.user_id==user_id , Users.role=="administrative").first()
    if not found_user:
        raise HTTPException(status.HTTP_403_FORBIDDEN,detail="you are not allwoed to come here")
    
    
    existing_department = db.query(Department).filter(Department.dept_name == dept_name).first()
    if existing_department:
        raise HTTPException(status_code=400, detail="A department with this name already exists")
    
    image_url=upload_user_profile_image(profile_picture)
    
    new_department=Department(
    dept_name=dept_name,
    description=description,
    profile_picture =image_url
    )
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return{"message":"department added succesfully"}


def fetch_department(authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    
    found_admin=db.query(Users).filter(Users.user_id==admin_id,Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="dont come here")
    
    found_departments=db.query(Department).all()
        
    return[
        {   "id":dept.id,
            "department_name":dept.dept_name,
            "created_at":dept.created_at,
            "description":dept.description,
            "profile_picture":dept.profile_picture,
        }
        for dept in found_departments
    ]    
    
def fetch_single_department(id:int,authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    
    found_admin=db.query(Users).filter(Users.user_id==admin_id,Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="dont come here")
    
    found_department=db.query(Department).filter(Department.id==id).first()
    
    return{
            "id":found_department.id,
            "department_name":found_department.dept_name,
            "created_at":found_department.created_at,
            "description":found_department.description,
            "profile_picture":found_department.profile_picture,
        
    }
    
def add_director_to_department(
    data: directorcredentials,
    authorization: str | None = Header(None),
    department_id: int = Query(...),
    db: Session = Depends(connect_databse)
):

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role == "administrative"
    ).first()

    if not found_admin:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="dont come here")

    found_department = db.query(Department).filter(Department.id == department_id).first()
    if not found_department:
        raise HTTPException(status_code=404, detail="Department not found")

    if found_department.director_id is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Department already has a director")

    existing_user = db.query(Users).filter(Users.email == data.email).first()
    if existing_user:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="User with this email already exists")

    new_director = Users(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_number=data.phone_number,
        password_hashed=hash_password(data.password_hashed),
        role="director"
    )

    db.add(new_director)
    db.commit()
    db.refresh(new_director)

    found_department.director_id = new_director.user_id
    db.commit()
    db.refresh(found_department)

    return {"message": "director added"}

    
def add_professor_subject_to_class(data:subjectschema,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role == "administrative"
    ).first()
    
    if not found_admin:
        raise HTTPException(status_code=401, detail="dont come here")
    
    professors=db.query(Users).filter(Users.role=="professor").all()
    
    new_subject=Subjects(
        subject_name=data.subject_name,
        multiplier=data.multiplier,
        professor_id=data.professor_id,
        department_id=data.department_id
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return{
        "msg":f"subject added{new_subject.subject_name}and proffessor{new_subject.professor_id}"
    }
    
def fetch_professors(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    found_admin = db.query(Users).filter(Users.user_id == admin_id,Users.role == "administrative").first()

    if not found_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    professors = db.query(Users).options(joinedload(Users.subjects)).filter(Users.role == "professor").all()

    return [
        {
            "user_id": pr.user_id,
            "first_name": pr.first_name,
            "last_name": pr.last_name,
            "email": pr.email,
            "subjects": [
                {
                    "subject_id": sub.subject_id,
                    "subject_name": sub.subject_name
                }
                for sub in pr.subjects
            ]
        }
        for pr in professors
    ]

def fetch_subjects_per_department(department_id:int,authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    found_admin = db.query(Users).filter(Users.user_id == admin_id,Users.role == "administrative").first()

    if not found_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    
    found_subjects=db.query(Subjects).filter(Subjects.department_id==department_id).all()

    return[
        {
            "subject_name":subject.subject_name,
            "multiplier":subject.multiplier
        }
        for subject in found_subjects
    ]
    
    
def fetch_department_director(authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    director_id = payload["sub"]
    
    found_director=db.query(Users).filter(Users.user_id==director_id,Users.role=="director").first()
    
    if not found_director:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="dont come here")
    
    found_departments=db.query(Department).all()
        
    return[
        {   "id":dept.id,
            "department_name":dept.dept_name,
            "created_at":dept.created_at,
            "description":dept.description,
            "profile_picture":dept.profile_picture,
        }
        for dept in found_departments
    ]
    
    
def fetch_professors_students(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    found_admin = db.query(Users).filter(Users.user_id == admin_id,Users.role == "student").first()

    if not found_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    professors = db.query(Users).filter(Users.role.in_(["professor", "administrative", "director"])).all()

    return [
        {
            "user_id": pr.user_id,
            "first_name": pr.first_name,
            "last_name": pr.last_name,
            "role":pr.role,
            "profile_picture":pr.profile_picture,
            "email": pr.email
        }
        for pr in professors
    ]
    
    
    
def fetch_students_professors(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    found_user = db.query(Users).filter(Users.user_id == admin_id,Users.role=="professor").first()

    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")

    students = db.query(Users).filter(Users.role == "student").all()

    return [
        {
            "user_id": std.user_id,
            "first_name": std.first_name,
            "last_name": std.last_name,
            "email": std.email,
            "role":std.role,
            "profile_picture":std.profile_picture
        }
        for std in students 
    ]
    
def fetch_students_for_director(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    found_user = db.query(Users).filter(Users.user_id == admin_id,Users.role=="director").first()

    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")

    students = db.query(Users).filter(Users.role == "student").all()

    return [
        {
            "user_id": std.user_id,
            "first_name": std.first_name,
            "last_name": std.last_name,
            "email": std.email,
            "role":std.role,
            "profile_picture":std.profile_picture
        }
        for std in students 
    ]
    
def fetch_students_for_admin(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload["sub"]
    found_user = db.query(Users).filter(Users.user_id == admin_id,Users.role=="administrative").first()

    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")

    students = db.query(Users).filter(Users.role == "student").all()

    return [
        {
            "user_id": std.user_id,
            "first_name": std.first_name,
            "last_name": std.last_name,
            "email": std.email,
            "role":std.role,
            "profile_picture":std.profile_picture
        }
        for std in students 
    ]
    
def delete_department(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    found_user = db.query(Users).filter(Users.user_id == user_id, Users.role == "administrative").first()
    if not found_user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You are not allowed to perform this action")
    
    # Find the department
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    # Delete the department (cascade will handle related records)
    db.delete(department)
    db.commit()
    
    return {"message": "Department deleted successfully"}


def fetch_subjects_for_director_and_admin(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    # Verify user is director or admin
    found_user = db.query(Users).filter(
        Users.user_id == user_id,
        Users.role.in_(["director", "administrative"])
    ).first()
    
    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Fetch subjects with professor information
    subjects = db.query(Subjects).filter(Subjects.department_id == department_id).all()
    
    return [
        {
            "subject_id": subject.subject_id,
            "subject_name": subject.subject_name,
            "multiplier": subject.multiplier,
            "professor_name": f"{db.query(Users).filter(Users.user_id == subject.professor_id).first().first_name} {db.query(Users).filter(Users.user_id == subject.professor_id).first().last_name}" if subject.professor_id and db.query(Users).filter(Users.user_id == subject.professor_id).first() else "No professor assigned"
        }
        for subject in subjects
    ]
    
def fetch_department_director_info(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    # Verify user is admin or director
    found_user = db.query(Users).filter(
        Users.user_id == user_id,
        Users.role.in_(["administrative", "director"])
    ).first()
    
    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Find the department by ID
    found_department = db.query(Department).filter(Department.id == department_id).first()
    
    if not found_department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get director info if assigned
    director_info = None
    if found_department.director_id:
        director = db.query(Users).filter(Users.user_id == found_department.director_id).first()
        if director:
            director_info = {
                "user_id": director.user_id,
                "first_name": director.first_name,
                "last_name": director.last_name,
                "email": director.email,
                "profile_picture": director.profile_picture
            }
    
    return {
        "department": {
            "id": found_department.id,
            "department_name": found_department.dept_name,
            "created_at": found_department.created_at,
            "description": found_department.description,
            "profile_picture": found_department.profile_picture,
        },
        "director": director_info
    }
    
    
def delete_director(department_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    # Verify user is admin
    found_user = db.query(Users).filter(Users.user_id == user_id, Users.role == "administrative").first()
    if not found_user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You are not allowed to perform this action")
    
    # Find the department
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    if not department.director_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No director assigned to this department")
    
    director_id = department.director_id
    
    # Remove director from department
    department.director_id = None
    db.commit()
    
    # Optionally delete the director user account
    director = db.query(Users).filter(Users.user_id == director_id).first()
    if director:
        db.delete(director)
        db.commit()
    
    return {"message": "Director removed successfully"}