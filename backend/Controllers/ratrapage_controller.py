from Database.connection import connect_databse
from sqlalchemy.orm import Session
from fastapi import HTTPException, Header, Depends, status
from Utils.jwt_handler import verify_token
from Models.Users import Users
from Models.Ratrapage import Ratrapage
from Models.Classes import Classes
from Models.Rooms import Room
from Models.Department import Department
from Models.Subjects import Subjects
from Schemas.ratrapage_schema import RatrapageSchema

def add_ratrapage(data: RatrapageSchema, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    # Check if user is admin or professor
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
    
    # Validate that all foreign keys exist
    user = db.query(Users).filter(Users.user_id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    class_ = db.query(Classes).filter(Classes.id == data.class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    room = db.query(Room).filter(Room.room_id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    department = db.query(Department).filter(Department.id == data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    subject = db.query(Subjects).filter(Subjects.subject_id == data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check for time conflicts in the same room
    conflicting_ratrapage = db.query(Ratrapage).filter(
        Ratrapage.room_id == data.room_id,
        Ratrapage.date == data.date,
        ((Ratrapage.start_time <= data.start_time) & (Ratrapage.end_time > data.start_time)) |
        ((Ratrapage.start_time < data.end_time) & (Ratrapage.end_time >= data.end_time)) |
        ((Ratrapage.start_time >= data.start_time) & (Ratrapage.end_time <= data.end_time))
    ).first()
    
    if conflicting_ratrapage:
        raise HTTPException(status_code=400, detail="Room is already booked for this time slot")
    
    # Create new ratrapage
    new_ratrapage = Ratrapage(
        user_id=data.user_id,
        class_id=data.class_id,
        room_id=data.room_id,
        department_id=data.department_id,
        subject_id=data.subject_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        description=data.description
    )
    
    db.add(new_ratrapage)
    db.commit()
    db.refresh(new_ratrapage)
    
    return {
        "message": "Ratrapage created successfully",
        "ratrapage_id": new_ratrapage.id,
        "user_id": new_ratrapage.user_id,
        "class_id": new_ratrapage.class_id,
        "room_id": new_ratrapage.room_id,
        "department_id": new_ratrapage.department_id,
        "subject_id": new_ratrapage.subject_id,
        "date": new_ratrapage.date,
        "start_time": new_ratrapage.start_time,
        "end_time": new_ratrapage.end_time,
        "description": new_ratrapage.description,
        "created_at": new_ratrapage.created_at
    }


def fetch_ratrapages(class_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload["sub"]
    
    # Check if user exists
    found_user = db.query(Users).filter(Users.user_id == user_id).first()
    
    if not found_user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
    
    # Verify class exists
    class_ = db.query(Classes).filter(Classes.id == class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Fetch all ratrapages for the class
    ratrapages = db.query(Ratrapage).filter(Ratrapage.class_id == class_id).all()
    
    result = []
    for ratrapage in ratrapages:
        # Get related user (professor)
        user = db.query(Users).filter(Users.user_id == ratrapage.user_id).first()
        room = db.query(Room).filter(Room.room_id == ratrapage.room_id).first()
        subject = db.query(Subjects).filter(Subjects.subject_id == ratrapage.subject_id).first()
        
        result.append({
            "ratrapage_id": ratrapage.id,
            "user_id": ratrapage.user_id,
            "professor": {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            } if user else None,
            "class_id": ratrapage.class_id,
            "room_id": ratrapage.room_id,
            "room": {
                "room_id": room.room_id,
                "room_name": room.room_name,
                "type": room.type
            } if room else None,
            "department_id": ratrapage.department_id,
            "subject_id": ratrapage.subject_id,
            "subject": {
                "subject_id": subject.subject_id,
                "subject_name": subject.subject_name
            } if subject else None,
            "date": ratrapage.date,
            "start_time": ratrapage.start_time,
            "end_time": ratrapage.end_time,
            "description": ratrapage.description,
            "created_at": ratrapage.created_at
        })
    
    return result


def update_ratrapage(ratrapage_id: int, data: RatrapageSchema, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    # Check if user is admin
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
    
    # Find the ratrapage to update
    ratrapage = db.query(Ratrapage).filter(Ratrapage.id == ratrapage_id).first()
    if not ratrapage:
        raise HTTPException(status_code=404, detail="Ratrapage not found")
    
    # Validate that all foreign keys exist
    user = db.query(Users).filter(Users.user_id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    class_ = db.query(Classes).filter(Classes.id == data.class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    room = db.query(Room).filter(Room.room_id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    department = db.query(Department).filter(Department.id == data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    subject = db.query(Subjects).filter(Subjects.subject_id == data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check for time conflicts in the same room (excluding current ratrapage)
    conflicting_ratrapage = db.query(Ratrapage).filter(
        Ratrapage.id != ratrapage_id,
        Ratrapage.room_id == data.room_id,
        Ratrapage.date == data.date,
        ((Ratrapage.start_time <= data.start_time) & (Ratrapage.end_time > data.start_time)) |
        ((Ratrapage.start_time < data.end_time) & (Ratrapage.end_time >= data.end_time)) |
        ((Ratrapage.start_time >= data.start_time) & (Ratrapage.end_time <= data.end_time))
    ).first()
    
    if conflicting_ratrapage:
        raise HTTPException(status_code=400, detail="Room is already booked for this time slot")
    
    # Update ratrapage fields
    ratrapage.user_id = data.user_id
    ratrapage.class_id = data.class_id
    ratrapage.room_id = data.room_id
    ratrapage.department_id = data.department_id
    ratrapage.subject_id = data.subject_id
    ratrapage.date = data.date
    ratrapage.start_time = data.start_time
    ratrapage.end_time = data.end_time
    ratrapage.description = data.description
    
    db.commit()
    db.refresh(ratrapage)
    
    return {
        "message": "Ratrapage updated successfully",
        "ratrapage_id": ratrapage.id,
        "user_id": ratrapage.user_id,
        "class_id": ratrapage.class_id,
        "room_id": ratrapage.room_id,
        "department_id": ratrapage.department_id,
        "subject_id": ratrapage.subject_id,
        "date": ratrapage.date,
        "start_time": ratrapage.start_time,
        "end_time": ratrapage.end_time,
        "description": ratrapage.description,
        "created_at": ratrapage.created_at
    }


def delete_ratrapage(ratrapage_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    # Check if user is admin
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
    
    # Find the ratrapage to delete
    ratrapage = db.query(Ratrapage).filter(Ratrapage.id == ratrapage_id).first()
    if not ratrapage:
        raise HTTPException(status_code=404, detail="Ratrapage not found")
    
    db.delete(ratrapage)
    db.commit()
    
    return {
        "message": "Ratrapage deleted successfully",
        "ratrapage_id": ratrapage_id
    }


def fetch_ratrapages_for_professor(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    professor_id = payload["sub"]
    
    # Check if user exists and is a professor
    found_professor = db.query(Users).filter(
        Users.user_id == professor_id,
        Users.role == "professor").first()
    
    if not found_professor:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Unauthorized access or not a professor")
    
    # Fetch all ratrapages for the professor
    ratrapages = db.query(Ratrapage).filter(Ratrapage.user_id == professor_id).all()
    
    result = []
    for ratrapage in ratrapages:
        # Get related entities
        class_ = db.query(Classes).filter(Classes.id == ratrapage.class_id).first()
        room = db.query(Room).filter(Room.room_id == ratrapage.room_id).first()
        subject = db.query(Subjects).filter(Subjects.subject_id == ratrapage.subject_id).first()
        department = db.query(Department).filter(Department.id == ratrapage.department_id).first()
        
        result.append({
            "ratrapage_id": ratrapage.id,
            "user_id": ratrapage.user_id,
            "class_id": ratrapage.class_id,
            "class_name": class_.name if class_ else None,
            "room_id": ratrapage.room_id,
            "room": {
                "room_id": room.room_id,
                "room_name": room.room_name,
                "type": room.type
            } if room else None,
            "department_id": ratrapage.department_id,
            "department_name": department.name if department else None,
            "subject_id": ratrapage.subject_id,
            "subject": {
                "subject_id": subject.subject_id,
                "subject_name": subject.subject_name
            } if subject else None,
            "date": ratrapage.date,
            "start_time": ratrapage.start_time,
            "end_time": ratrapage.end_time,
            "description": ratrapage.description,
            "created_at": ratrapage.created_at
        })
    
    return result
    
