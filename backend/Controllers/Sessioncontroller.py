from Models.Department import Department
from Models.Classes import Classes
from Database.connection import connect_databse
from Utils.cloudinary_uploader import upload_user_profile_image
from fastapi import Depends, File, Form, HTTPException, Header, UploadFile,status
from sqlalchemy.orm import Session as DBSession
from sqlalchemy.orm import joinedload
from Models.Users import Users
from Utils.jwt_handler import verify_token
from Models.Subjects import Subjects
from Schemas.roomscrd import roomscrd
from Models.Rooms import Room
from Models.Session import Session as SessionModel
from Schemas.sessionschema import sessionschema

def fetch_professors(
    authorization: str | None = Header(None),
    db: DBSession = Depends(connect_databse)
):
    if not authorization or not authorization.startswith("Bearer "):
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
        raise HTTPException(status_code=403, detail="Not authorized")

   
    professors = (
        db.query(Users)
        .options(joinedload(Users.subjects))
        .filter(Users.role == "professor")
        .all()
    )

    result = []
    for professor in professors:
        prof_dict = {
            "user_id": professor.user_id,
            "first_name": professor.first_name,
            "last_name": professor.last_name,
            "subjects": [
                {
                    "subject_id": s.subject_id,
                    "subject_name": s.subject_name,
                    "multiplier": s.multiplier,
                    "class_id": s.class_id,
                }
                for s in professor.subjects
            ],
        }
        result.append(prof_dict)

    return {"professors": result}

def fetch_professors(authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
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
        raise HTTPException(status_code=403, detail="Access denied")

    professors = (
        db.query(Users)
        .options(joinedload(Users.subjects)) 
        .filter(Users.role == "professor")
        .all()
    )

    result = []
    for pr in professors:
        result.append({
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
        })

    return result
    
def fetch_rooms_of_department(id:int,authorization: str | None = Header(None),
    db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
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
        raise HTTPException(status_code=401, detail="Not authorized")
    
    rooms = db.query(Room).filter(Room.department_id == id).all()

    return [
        {
            "room_id": room.room_id,
            "room_name": room.room_name,
            "type": room.type,
        }
        for room in rooms
    ]

def add_session(data: sessionschema, authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id, Users.role == "administrative"
    ).first()
    if not found_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    professor = db.query(Users).filter(Users.user_id == data.professor_id, Users.role == "professor").first()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    room = db.query(Room).filter(Room.room_id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    subject = db.query(Subjects).filter(Subjects.subject_id == data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    class_ = db.query(Classes).filter(Classes.id == data.class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    from datetime import datetime
    
    def parse_time(time_str):
        return datetime.strptime(time_str, "%H:%M")
    
    def time_overlap(start1, end1, start2, end2):
        s1 = parse_time(start1)
        e1 = parse_time(end1)
        s2 = parse_time(start2)
        e2 = parse_time(end2)
        return s1 < e2 and e1 > s2  
    
    existing_sessions = db.query(SessionModel).filter(SessionModel.day == data.day).all()

    for s in existing_sessions:
        if time_overlap(data.start_time, data.end_time, s.start_time, s.end_time):
            # Room conflict
            if s.room_id == data.room_id:
                raise HTTPException(status_code=409, detail=f"Room '{room.room_name}' is already occupied at this time.")
            # Professor conflict
            if s.professor_id == data.professor_id:
                raise HTTPException(status_code=409, detail=f"Professor '{professor.first_name} {professor.last_name}' is already teaching another session at this time.")
    new_session = SessionModel(
        class_id=data.class_id,
        room_id=data.room_id,
        professor_id=data.professor_id,
        subject_id=data.subject_id,
        start_time=data.start_time,
        end_time=data.end_time,
        day=data.day
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "message": "Session added successfully",
        "session_id": new_session.session_id
    }
def fetch_subjects(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id, Users.role == "administrative"
    ).first()
    if not found_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    
    subjects = db.query(Subjects).filter(Subjects.department_id == id).all()

    return [
        {
            "subject_id": subject.subject_id,
            "subject_name": subject.subject_name,
            "multiplier": subject.multiplier,
            "professor_id": subject.professor_id,
            "department_id": subject.department_id,
        }
        for subject in subjects
    ]
    
def fetch_sessions(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

    token = authorization.split(" ")[1]
    
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin = db.query(Users).filter(Users.user_id == admin_id, Users.role == "administrative").first()
    
    if not found_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    found_sessions = db.query(SessionModel).filter(SessionModel.class_id == id).all()

    return [
        {
            "session_id": found_session.session_id,
            "class_id": found_session.class_id,
            "room_id": found_session.room_id,
            "professor_id": found_session.professor_id,
            "subject_id": found_session.subject_id,
            "start_time": found_session.start_time,
            "end_time": found_session.end_time,
            "day": found_session.day,
        }
        for found_session in found_sessions
    ]
    

def fetch_session_for_students(authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
   
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    student_id = payload["sub"]
    
    student = db.query(Users).filter(
        Users.user_id == student_id,
        Users.role == "student"
    ).first()
    
    if not student:
        raise HTTPException(status_code=403, detail="Student not found or unauthorized")
    
    if not student.class_name:
        raise HTTPException(status_code=404, detail="Student is not assigned to any class")
    
    # Find the class by name to get its ID
    student_class = db.query(Classes).filter(Classes.name == student.class_name).first()
    if not student_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    sessions = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.professor),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.class_id == student_class.id)
        .all()
    )
    
   
    result = []
    for session in sessions:
        session_data = {
            "session_id": session.session_id,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "day": session.day,
            "professor_name": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else None,
            "subject_name": session.subject.subject_name if session.subject else None,
            "room_id": session.room_id,
            "room_name": session.room.room_name if session.room else None,
        }
        result.append(session_data)
    
    return {
        "class_id": student_class.id,
        "sessions": result
    }


def fetch_professor_sessions(authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

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
    
    
    sessions = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.class_),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.professor_id == professor_id)
        .all()
    )
    
    
    result = []
    for session in sessions:
        session_data = {
            "session_id": session.session_id,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "day": session.day,
            "class_name": session.class_.name if session.class_ else None,
            "subject_name": session.subject.subject_name if session.subject else None,
            "room_id": session.room_id,
            "room_name": session.room.room_name if session.room else None,
        }
        result.append(session_data)
    
    return {
        "professor_id": professor_id,
        "professor_name": f"{professor.first_name} {professor.last_name}",
        "sessions": result
    }



def fetch_sessions_for_class(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

    token = authorization.split(" ")[1]
    
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    professor_id = payload["sub"]
    
    found_professor = db.query(Users).filter(Users.user_id == professor_id, Users.role == "professor").first()
    
    if not found_professor:
        raise HTTPException(status_code=403, detail="Not authorized")
    
  
    found_sessions = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.class_),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room),
            joinedload(SessionModel.professor)
        )
        .filter(SessionModel.class_id == id, SessionModel.professor_id == professor_id)
        .all()
        )

    return [
        {
            "session_id": found_session.session_id,
            "class_id": found_session.class_id,
            "class_name": found_session.class_.name if found_session.class_ else None,
            "room_id": found_session.room_id,
            "room_name": found_session.room.room_name if found_session.room else None,
            "professor_id": found_session.professor_id,
            "professor_name": f"{found_session.professor.first_name} {found_session.professor.last_name}" if found_session.professor else None,
            "professor_user_id": found_session.professor.user_id if found_session.professor else None,
            "subject_id": found_session.subject_id,
            "subject_name": found_session.subject.subject_name if found_session.subject else None,
            "start_time": found_session.start_time,
            "end_time": found_session.end_time,
            "day": found_session.day,
        }
        for found_session in found_sessions
    ]
    
    
def fetch_sessions_for_class_for_director(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing authorization header")

    token = authorization.split(" ")[1]
    
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin = db.query(Users).filter(Users.user_id == admin_id,Users.role=="director" ).first()
    
    if not found_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    found_sessions = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.class_),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.class_id == id)
        .all()
        )

    return [
        {
            "session_id": found_session.session_id,
            "class_id": found_session.class_id,
            "class_name": found_session.class_.name if found_session.class_ else None,
            "room_id": found_session.room_id,
            "room_name": found_session.room.room_name if found_session.room else None,
            "professor_id": found_session.professor_id,
            "subject_id": found_session.subject_id,
            "subject_name": found_session.subject.subject_name if found_session.subject else None,
            "start_time": found_session.start_time,
            "end_time": found_session.end_time,
            "day": found_session.day,
        }
        for found_session in found_sessions
    ]
    
    
def fetch_single_session(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    professor_id = payload["sub"]

    found_professor = db.query(Users).filter(
        Users.user_id == professor_id,
        Users.role == "professor"
    ).first()

    if not found_professor:
        raise HTTPException(status_code=403, detail="Not authorized")
    
   
    session = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.class_),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.session_id == id)
        .first()
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "class_name": session.class_.name if session.class_ else None,
        "room_id": session.room_id,
        "room_name": session.room.room_name if session.room else None,
        "professor_id": session.professor_id,
        "subject_id": session.subject_id,
        "subject_name": session.subject.subject_name if session.subject else None,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "day": session.day
    }
    


def fetch_single_session_for_admin(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
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
        raise HTTPException(status_code=403, detail="Not authorized")
    
   
    session = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.professor),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.session_id == id)
        .first()
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "room_id": session.room_id,
        "room_name": session.room.room_name if session.room else None,
        "professor_id": session.professor_id,
        "professor_name": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else None,
        "subject_id": session.subject_id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "day": session.day
    }
    
    
def fetch_single_session_for_director(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
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
        raise HTTPException(status_code=403, detail="Not authorized")
    
   
    session = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.professor),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.session_id == id)
        .first()
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "room_id": session.room_id,
        "room_name": session.room.room_name if session.room else None,
        "professor_id": session.professor_id,
        "professor_name": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else None,
        "subject_id": session.subject_id,
        "subject_name": session.subject.subject_name if session.subject else None,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "day": session.day
    }
    

def fetch_single_session_for_student(id:int,authorization: str | None = Header(None),db: DBSession = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    student_id = payload["sub"]

    found_student = db.query(Users).filter(
        Users.user_id == student_id,
        Users.role == "student"
    ).first()

    if not found_student:
        raise HTTPException(status_code=403, detail="Not authorized")
    
   
    session = (
        db.query(SessionModel)
        .options(
            joinedload(SessionModel.professor),
            joinedload(SessionModel.subject),
            joinedload(SessionModel.room)
        )
        .filter(SessionModel.session_id == id)
        .first()
    )
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "room_id": session.room_id,
        "room_name": session.room.room_name if session.room else None,
        "professor_id": session.professor_id,
        "professor_name": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else None,
        "subject_id": session.subject_id,
        "subject_name": session.subject.subject_name if session.subject else None,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "day": session.day
    }