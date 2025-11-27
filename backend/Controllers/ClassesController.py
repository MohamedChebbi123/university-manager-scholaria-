from Database.connection import connect_databse
from Models.Classes import Classes
from Models.Department import Department
from Utils.cloudinary_uploader import upload_user_profile_image
from fastapi import Depends, File, Form, HTTPException, Header, UploadFile,status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from Models.Users import Users
from Utils.jwt_handler import verify_token
from Schemas.subjectshcma import subjectschema
from Models.Subjects import Subjects
def add_class_to_department( 
    name:str =Form(...),
    capacity : int =Form(...),
    profile_picture: UploadFile = File(...),
    description : str = Form(...),
    department_id:int=Form(...),
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
    
    admin_id = payload["sub"]
    
    found_admin=db.query(Users).filter(Users.user_id==admin_id,Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="dont come here")
    
    # Check if class with same name already exists in this department
    existing_class = db.query(Classes).filter(
        Classes.name == name,
        Classes.department_id == department_id
    ).first()
    
    if existing_class:
        raise HTTPException(status_code=400, detail="A class with this name already exists in this department")
    
    image_url=upload_user_profile_image(profile_picture)
    
    new_class=Classes(
        name=name,
        capacity=capacity,
        profile_picture=image_url,
        description=description,
        department_id=department_id
    )
    
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return{
        "msg":"class addded succesfully"
    }
    
def fetch_classes(department_id: int,
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
    
    admin_id = payload["sub"]
    
    found_admin=db.query(Users).filter(Users.user_id==admin_id,Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="dont come here")
    
    found_classes=db.query(Classes).filter(Classes.department_id==department_id).all()
    print(found_classes)
    
    return [
    {   
        "class_id":found_class.id,
        "name": found_class.name,
        "capacity": found_class.capacity,
        "profile_picture": found_class.profile_picture,
        "description": found_class.description,
    }
    for found_class in found_classes
]
   
   
def fetch_class_info(class_id: int,
                     authorization: str | None = Header(None),
                     db: Session = Depends(connect_databse)):

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
    
    
    found_class = db.query(Classes).filter(Classes.id == class_id).first()
    
    if not found_class:
        raise HTTPException(status_code=404, detail="class not found")
    
    # Query users who have this class name
    class_users = db.query(Users).filter(Users.class_name == found_class.name).all()
    
    return {
        "class_id": found_class.id,
        "name": found_class.name,
        "capacity": found_class.capacity,
        "profile_picture": found_class.profile_picture,
        "description": found_class.description,
        "users": [
            {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role
            }
            for user in class_users
        ]
    }
    
def fetch_student_class(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    student_id = payload["sub"]

    student = (
        db.query(Users)
        .filter(Users.user_id == student_id, Users.role == "student") 
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if not student.class_name:
        raise HTTPException(status_code=404, detail="Student has no class assigned")
    
    # Get the class information
    student_class = db.query(Classes).filter(Classes.name == student.class_name).first()
    if not student_class:
        raise HTTPException(status_code=404, detail="Class not found")

    return {
        "id": student.user_id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": student.email,
        "class": {
            "id": student_class.id,
            "name": student_class.name,
            "capacity": student_class.capacity,
            "description": student_class.description
        }
    }
    
def fetch_professor_classes(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    professor_id = payload["sub"]

    professor = db.query(Users).filter(
        Users.user_id == professor_id,
        Users.role == "professor"
    ).first()

    if not professor:
        raise HTTPException(status_code=403, detail="Professor not found or unauthorized")

    professor_subjects = db.query(Subjects).filter(
        Subjects.professor_id == professor_id
    ).all()

    if not professor_subjects:
        return {
            "professor_id": professor_id,
            "professor_name": f"{professor.first_name} {professor.last_name}",
            "classes": []
        }

    department_ids = list(set([subject.department_id for subject in professor_subjects]))

    classes = db.query(Classes).filter(
        Classes.department_id.in_(department_ids)
    ).all()

    result = []
    for cls in classes:
        result.append({
            "class_id": cls.id,
            "name": cls.name,
            "capacity": cls.capacity,
            "profile_picture": cls.profile_picture,
            "description": cls.description,
            "department_id": cls.department_id
        })

    return {
        "professor_id": professor_id,
        "professor_name": f"{professor.first_name} {professor.last_name}",
        "classes": result
    }
    
def fetch_class_info_pr(class_id: int,
                     authorization: str | None = Header(None),
                     db: Session = Depends(connect_databse)):

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
        Users.role == "professor"
    ).first()
    
    if not found_admin:
        raise HTTPException(status_code=401, detail="dont come here")
    
    
    found_class = db.query(Classes).filter(Classes.id == class_id).first()
    
    if not found_class:
        raise HTTPException(status_code=404, detail="class not found")
    
    # Query users who have this class name
    class_users = db.query(Users).filter(Users.class_name == found_class.name).all()
    
    return {
        "class_id": found_class.id,
        "name": found_class.name,
        "capacity": found_class.capacity,
        "profile_picture": found_class.profile_picture,
        "description": found_class.description,
        "users": [
            {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role
            }
            for user in class_users
        ]
    }
    

def fetch_classes_dr(
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
    
    admin_id = payload["sub"]
    
    found_director=db.query(Users).filter(Users.user_id==admin_id,Users.role=="director").first()
    
    if not found_director:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,detail="dont come here")
    
    found_classes=db.query(Classes).filter(Classes.department_id==Department.id).all()
    
    
    return [
    {   
        "class_id":found_class.id,
        "name": found_class.name,
        "capacity": found_class.capacity,
        "profile_picture": found_class.profile_picture,
        "description": found_class.description,
    }
    for found_class in found_classes
]
    
    
def fetch_class_info_dir(class_id: int,
                     authorization: str | None = Header(None),
                     db: Session = Depends(connect_databse)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    director_id = payload["sub"]
    
    found_director = db.query(Users).filter(
        Users.user_id == director_id,
        Users.role == "director"
    ).first()
    
    if not found_director:
        raise HTTPException(status_code=401, detail="dont come here")
    
    
    found_class = db.query(Classes).filter(Classes.id == class_id).first()
    
    if not found_class:
        raise HTTPException(status_code=404, detail="class not found")
    
    # Query users who have this class name
    class_users = db.query(Users).filter(Users.class_name == found_class.name).all()
    
    return {
        "class_id": found_class.id,
        "name": found_class.name,
        "capacity": found_class.capacity,
        "profile_picture": found_class.profile_picture,
        "description": found_class.description,
        "users": [
            {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role
            }
            for user in class_users
        ]
    }
    
def fetch_users_for_session(class_id: int,
                     authorization: str | None = Header(None),
                     db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # First get the class name
    found_class = db.query(Classes).filter(Classes.id == class_id).first()
    if not found_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Query students by class_name
    students = db.query(Users).filter(
        Users.class_name == found_class.name,
        Users.role == "student"
    ).all()
    
    return [
            {
                "user_id": student.user_id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email
            }
            for student in students
    ]
    
