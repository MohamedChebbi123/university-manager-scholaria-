from fastapi import Depends, HTTPException, Header, UploadFile,status,Form
from Models.Session import Session
from Models.Absence import Absence
from Models.Classes import Classes
from Models.Users import Users
from Models.Subjects import Subjects
from Utils.jwt_handler import verify_token
from Utils.email_sender import send_absence_notification, send_absence_request_accepted, send_absence_request_rejected
from Schemas.absenceshcema import absenceschema
from Database.connection import connect_databse
from datetime import datetime
from Utils.cloudinary_uploader import upload_user_profile_image
from Models.Demande import Demande

async def assign_absence(
    data: absenceschema,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):

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
        raise HTTPException(status_code=401, detail="Not authorized")

    student = db.query(Users).filter(Users.user_id == data.user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    class_info = db.query(Classes).filter(Classes.id == data.class_id).first()
    session_info = db.query(Session).filter(Session.session_id == data.session_id).first()

    new_absence = Absence(
        user_id=data.user_id,            
        class_id=data.class_id,
        session_id=data.session_id,
        is_absent=data.is_absent    
    )

    
    db.add(new_absence)
    db.commit()
    db.refresh(new_absence)

    # Send email notification if student is marked absent
    email_sent = False
    if data.is_absent and student.email:
        try:
            student_name = f"{student.first_name} {student.last_name}"
            class_name = class_info.name if class_info else "Unknown Class"
            subject_name = session_info.subject.subject_name if session_info and session_info.subject else "Unknown Subject"
            absence_date = new_absence.date.strftime("%B %d, %Y") if new_absence.date else datetime.now().strftime("%B %d, %Y")
            
            email_sent = await send_absence_notification(
                email=student.email,
                student_name=student_name,
                class_name=class_name,
                subject=subject_name,
                date=absence_date
            )
        except Exception as e:
            print(f"Failed to send absence notification: {str(e)}")

    return {
        "msg": "Absence recorded",
        "absence_id": new_absence.id,
        "user_id": new_absence.user_id,
        "student_email": student.email,
        "is_absent": new_absence.is_absent,
        "email_sent": email_sent
    }
    
    
def fetch_absence_per_class_session(
    class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    
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
        raise HTTPException(status_code=401, detail="Not authorized")
    
    session = db.query(Session).filter(
        Session.session_id == session_id,
        Session.class_id == class_id,
        Session.professor_id == professor_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or you don't have access to it")
    
    
    absences = db.query(Absence).filter(
        Absence.class_id == class_id,
        Absence.session_id == session_id
    ).all()
    
    
    absence_list = []
    for absence in absences:
        absence_list.append({
            "absence_id": absence.id,
            "user_id": absence.user_id,
            "first_name": absence.user.first_name,
            "last_name": absence.user.last_name,
            "email": absence.user.email,
            "is_absent": absence.is_absent,
            "date": absence.date.isoformat() if absence.date else None
        })
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "class_name": session.class_.name,
        "subject": session.subject.subject_name,
        "day": session.day,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "absences": absence_list,
        "total_students": len(absence_list),
        "total_absent": sum(1 for a in absences if a.is_absent)
    }
    
def fetch_absence_per_class_session_admin(
    class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]

    found_professor = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role == "administrative"
    ).first()

    if not found_professor:
        raise HTTPException(status_code=401, detail="Not authorized")
    
    session = db.query(Session).filter(
        Session.session_id == session_id,
        Session.class_id == class_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or you don't have access to it")
    
    
    absences = db.query(Absence).filter(
        Absence.class_id == class_id,
        Absence.session_id == session_id
    ).all()
    
    
    absence_list = []
    for absence in absences:
        absence_list.append({
            "absence_id": absence.id,
            "user_id": absence.user_id,
            "first_name": absence.user.first_name,
            "last_name": absence.user.last_name,
            "email": absence.user.email,
            "is_absent": absence.is_absent,
            "date": absence.date.isoformat() if absence.date else None
        })
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "class_name": session.class_.name,
        "subject": session.subject.subject_name,
        "day": session.day,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "absences": absence_list,
        "total_students": len(absence_list),
        "total_absent": sum(1 for a in absences if a.is_absent)
    }
    
    
def fetch_absence_per_class_session_director(
    class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    
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
        raise HTTPException(status_code=401, detail="Not authorized")
    
    session = db.query(Session).filter(
        Session.session_id == session_id,
        Session.class_id == class_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or you don't have access to it")
    
    
    absences = db.query(Absence).filter(
        Absence.class_id == class_id,
        Absence.session_id == session_id
    ).all()
    
    
    absence_list = []
    for absence in absences:
        absence_list.append({
            "absence_id": absence.id,
            "user_id": absence.user_id,
            "first_name": absence.user.first_name,
            "last_name": absence.user.last_name,
            "email": absence.user.email,
            "is_absent": absence.is_absent,
            "date": absence.date.isoformat() if absence.date else None
        })
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "class_name": session.class_.name,
        "subject": session.subject.subject_name,
        "day": session.day,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "absences": absence_list,
        "total_students": len(absence_list),
        "total_absent": sum(1 for a in absences if a.is_absent)
    }
    
def fetch_absence_in_session(class_id: int,
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    
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
    
    # Get student's class ID from class_name
    if not found_student.class_name:
        raise HTTPException(status_code=403, detail="Student is not enrolled in any class")
    
    student_class = db.query(Classes).filter(Classes.name == found_student.class_name).first()
    if not student_class:
        raise HTTPException(status_code=404, detail="Student's class not found")
    
    # Verify the session exists
    session = db.query(Session).filter(
        Session.session_id == session_id,
        Session.class_id == class_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if student's class matches the session's class
    if student_class.id != class_id:
        raise HTTPException(status_code=403, detail="You are not enrolled in this class")
    
    # Fetch the absence record for this student in this session
    absence = db.query(Absence).filter(
        Absence.user_id == student_id,
        Absence.class_id == class_id,
        Absence.session_id == session_id
    ).first()
    
    if not absence:
        return {
            "session_id": session.session_id,
            "class_id": session.class_id,
            "class_name": session.class_.name,
            "subject": session.subject.subject_name,
            "professor_name": f"{session.professor.first_name} {session.professor.last_name}",
            "room_name": session.room.room_name,
            "day": session.day,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "absence_status": "not_recorded",
            "is_absent": None,
            "date": None,
            "message": "Absence not yet recorded for this session"
        }
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "class_name": session.class_.name,
        "subject": session.subject.subject_name,
        "professor_name": f"{session.professor.first_name} {session.professor.last_name}",
        "room_name": session.room.room_name,
        "day": session.day,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "absence_status": "recorded",
        "is_absent": absence.is_absent,
        "date": absence.date.isoformat() if absence.date else None,
        "absence_id": absence.id
    }
    
def demand_absence(
    reason: str=Form(...),
    document :UploadFile=Form(...),
    absence_id: int=Form(...),
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    student_id = payload["sub"]

    found_student = db.query(Users).filter(Users.user_id == student_id,Users.role=="student").first()
    
    if not found_student:
        raise HTTPException(status.HTTP_403_FORBIDDEN,detail="dont come here")
    
    document_url=upload_user_profile_image(document)
    
    new_demande=Demande(
         reason=reason,
         document=document_url,
         absence_id=absence_id
    )
    
    db.add(new_demande)
    db.commit()
    db.refresh(new_demande)
    return{
        "msg":"absence demanded"
    }
    
def fetch_requests( authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    director_id = payload["sub"]

    found_director = db.query(Users).filter(Users.user_id == director_id,Users.role=="director").first()
    
    if not found_director:
        raise HTTPException(status.HTTP_403_FORBIDDEN,detail="dont come here")
    
    demandes = db.query(Demande).all()
    
    demandes_list = []
    for demande in demandes:
        absence = demande.absence
        student = absence.user
        session = absence.session
        class_info = absence.class_
        
        demandes_list.append({
            "demande_id": demande.demande_id,
            "reason": demande.reason,
            "document": demande.document,
            "is_accepted": demande.is_accepted,
            "absence_id": absence.id,
            "absence_date": absence.date.isoformat() if absence.date else None,
            "student": {
                "user_id": student.user_id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email
            },
            "class": {
                "class_id": class_info.id,
                "class_name": class_info.name
            },
            "session": {
                "session_id": session.session_id,
                "subject": session.subject.subject_name,
                "day": session.day,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "professor": f"{session.professor.first_name} {session.professor.last_name}"
            } if session else None
        })
    
    return {
        "total_requests": len(demandes_list),
        "requests": demandes_list
    }
    
    



async def accept_demand(demande_id: int,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    director_id = payload["sub"]

    found_director = (
        db.query(Users)
        .filter(Users.user_id == director_id, Users.role == "director")
        .first()
    )

    if not found_director:
        raise HTTPException(status_code=403, detail="dont come here")

    demande = db.query(Demande).filter(Demande.demande_id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande not found")

    absence = db.query(Absence).filter(Absence.id == demande.absence_id).first()
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")

    # Get student and session information for email
    student = absence.user
    session = absence.session
    class_info = absence.class_

    demande.is_accepted = True
    absence.is_absent = False

    db.commit()

    # Send email notification to student
    try:
        await send_absence_request_accepted(
            email=student.email,
            student_name=f"{student.first_name} {student.last_name}",
            class_name=class_info.name,
            subject=session.subject.subject_name if session and session.subject else "Unknown",
            date=absence.date.strftime("%Y-%m-%d") if absence.date else "Unknown"
        )
    except Exception as e:
        print(f"Failed to send acceptance email: {str(e)}")
        # Don't fail the request if email fails

    return {"message": "Demande accepted and absence updated"}


async def reject_demand(demande_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    director_id = payload["sub"]

    found_director = (
        db.query(Users)
        .filter(Users.user_id == director_id, Users.role == "director")
        .first()
    )

    if not found_director:
        raise HTTPException(status_code=403, detail="dont come here")

    demande = db.query(Demande).filter(Demande.demande_id == demande_id).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande not found")

    # Get student and session information for email before deletion
    absence = db.query(Absence).filter(Absence.id == demande.absence_id).first()
    if absence:
        student = absence.user
        session = absence.session
        class_info = absence.class_
        
        # Send email notification to student
        try:
            await send_absence_request_rejected(
                email=student.email,
                student_name=f"{student.first_name} {student.last_name}",
                class_name=class_info.name,
                subject=session.subject.subject_name if session and session.subject else "Unknown",
                date=absence.date.strftime("%Y-%m-%d") if absence.date else "Unknown"
            )
        except Exception as e:
            print(f"Failed to send rejection email: {str(e)}")
            # Don't fail the request if email fails

    # Delete the demande
    db.delete(demande)
    db.commit()

    return {"message": "Demande rejected and deleted"}


def fetch_student_own_absences_in_session(
    session_id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    """
    Fetch a student's own absence history for a specific session (all occurrences)
    """
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
    
    # Get student's class ID from class_name
    if not found_student.class_name:
        raise HTTPException(status_code=403, detail="Student is not enrolled in any class")
    
    student_class = db.query(Classes).filter(Classes.name == found_student.class_name).first()
    if not student_class:
        raise HTTPException(status_code=404, detail="Student's class not found")
    
    # Verify the session exists
    session = db.query(Session).filter(Session.session_id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if student's class matches the session's class
    if student_class.id != session.class_id:
        raise HTTPException(status_code=403, detail="You are not enrolled in this class")
    
    # Fetch all absence records for this student in this specific session
    absences = db.query(Absence).filter(
        Absence.session_id == session_id,
        Absence.user_id == student_id
    ).order_by(Absence.date.desc()).all()
    
    absence_list = []
    for absence in absences:
        absence_list.append({
            "absence_id": absence.id,
            "is_absent": absence.is_absent,
            "date": absence.date.isoformat() if absence.date else None,
            "recorded_at": absence.date.strftime("%B %d, %Y") if absence.date else "Unknown"
        })
    
    # Calculate statistics
    total_records = len(absence_list)
    total_absences = sum(1 for a in absences if a.is_absent)
    total_present = sum(1 for a in absences if not a.is_absent)
    
    return {
        "session_id": session.session_id,
        "class_id": session.class_id,
        "class_name": session.class_.name,
        "subject": session.subject.subject_name if session.subject else "Unknown",
        "professor": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else "Unknown",
        "room": session.room.room_name if session.room else "Unknown",
        "day": session.day,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "student_name": f"{found_student.first_name} {found_student.last_name}",
        "total_records": total_records,
        "total_absences": total_absences,
        "total_present": total_present,
        "absence_history": absence_list
    }


def fetch_all_student_absences_by_subject(
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    """
    Fetch all absences for a student grouped by subject/session
    """
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
    
    # Fetch all absences for this student
    absences = db.query(Absence).filter(
        Absence.user_id == student_id
    ).order_by(Absence.date.desc()).all()
    
    # Group absences by session
    sessions_dict = {}
    for absence in absences:
        session = absence.session
        
        # Skip if session doesn't exist (orphaned absence record)
        if not session:
            continue
            
        session_id = session.session_id
        
        if session_id not in sessions_dict:
            sessions_dict[session_id] = {
                "session_id": session.session_id,
                "subject_name": session.subject.subject_name if session.subject else "Unknown",
                "subject_id": session.subject_id,
                "class_name": absence.class_.name if absence.class_ else "Unknown",
                "class_id": absence.class_id,
                "professor": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else "Unknown",
                "room": session.room.room_name if session.room else "Unknown",
                "day": session.day,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "absences": []
            }
        
        sessions_dict[session_id]["absences"].append({
            "absence_id": absence.id,
            "is_absent": absence.is_absent,
            "date": absence.date.isoformat() if absence.date else None,
            "recorded_at": absence.date.strftime("%B %d, %Y") if absence.date else "Unknown"
        })
    
    # Convert to list and add statistics
    sessions_list = []
    total_all_absences = 0
    total_all_present = 0
    
    for session_data in sessions_dict.values():
        absences_in_session = session_data["absences"]
        total_absences = sum(1 for a in absences_in_session if a["is_absent"])
        total_present = sum(1 for a in absences_in_session if not a["is_absent"])
        
        session_data["total_records"] = len(absences_in_session)
        session_data["total_absences"] = total_absences
        session_data["total_present"] = total_present
        
        total_all_absences += total_absences
        total_all_present += total_present
        
        sessions_list.append(session_data)
    
    # Sort by subject name
    sessions_list.sort(key=lambda x: x["subject_name"])
    
    return {
        "student_id": student_id,
        "student_name": f"{found_student.first_name} {found_student.last_name}",
        "total_sessions": len(sessions_list),
        "total_records": len(absences),
        "total_absences": total_all_absences,
        "total_present": total_all_present,
        "sessions": sessions_list
    }


def fetch_professor_subject_absences(
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    """
    Fetch all student absences for subjects that the professor teaches
    """
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
    
    # Get all sessions taught by this professor
    professor_sessions = db.query(Session).filter(
        Session.professor_id == professor_id
    ).all()
    
    if not professor_sessions:
        return {
            "professor_id": professor_id,
            "professor_name": f"{found_professor.first_name} {found_professor.last_name}",
            "total_subjects": 0,
            "total_students": 0,
            "total_absences": 0,
            "subjects": []
        }
    
    # Get unique subject IDs
    subject_ids = list(set([s.subject_id for s in professor_sessions if s.subject_id]))
    
    # Group data by subject
    subjects_dict = {}
    
    for session in professor_sessions:
        if not session.subject:
            continue
            
        subject_id = session.subject_id
        subject_name = session.subject.subject_name
        
        if subject_id not in subjects_dict:
            subjects_dict[subject_id] = {
                "subject_id": subject_id,
                "subject_name": subject_name,
                "sessions": {},
                "total_students": set(),
                "total_absences": 0,
                "total_present": 0
            }
        
        # Get all absences for this session
        session_absences = db.query(Absence).filter(
            Absence.session_id == session.session_id
        ).all()
        
        if session.session_id not in subjects_dict[subject_id]["sessions"]:
            subjects_dict[subject_id]["sessions"][session.session_id] = {
                "session_id": session.session_id,
                "class_id": session.class_id,
                "class_name": session.class_.name if session.class_ else "Unknown",
                "room": session.room.room_name if session.room else "Unknown",
                "day": session.day,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "students": []
            }
        
        # Add student absences
        for absence in session_absences:
            student = absence.user
            if student:
                subjects_dict[subject_id]["total_students"].add(student.user_id)
                
                student_data = {
                    "user_id": student.user_id,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "email": student.email,
                    "absence_id": absence.id,
                    "is_absent": absence.is_absent,
                    "date": absence.date.isoformat() if absence.date else None,
                    "recorded_at": absence.date.strftime("%B %d, %Y") if absence.date else "Unknown"
                }
                
                subjects_dict[subject_id]["sessions"][session.session_id]["students"].append(student_data)
                
                if absence.is_absent:
                    subjects_dict[subject_id]["total_absences"] += 1
                else:
                    subjects_dict[subject_id]["total_present"] += 1
    
    # Convert to list format
    subjects_list = []
    total_all_students = set()
    total_all_absences = 0
    
    for subject_data in subjects_dict.values():
        sessions_list = list(subject_data["sessions"].values())
        total_students_in_subject = len(subject_data["total_students"])
        total_all_students.update(subject_data["total_students"])
        total_all_absences += subject_data["total_absences"]
        
        subjects_list.append({
            "subject_id": subject_data["subject_id"],
            "subject_name": subject_data["subject_name"],
            "total_students": total_students_in_subject,
            "total_absences": subject_data["total_absences"],
            "total_present": subject_data["total_present"],
            "total_records": subject_data["total_absences"] + subject_data["total_present"],
            "sessions": sessions_list
        })
    
    # Sort by subject name
    subjects_list.sort(key=lambda x: x["subject_name"])
    
    return {
        "professor_id": professor_id,
        "professor_name": f"{found_professor.first_name} {found_professor.last_name}",
        "total_subjects": len(subjects_list),
        "total_students": len(total_all_students),
        "total_absences": total_all_absences,
        "subjects": subjects_list
    }


def fetch_all_absences_by_subject_admin(
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    """
    Fetch all student absences grouped by subject for admin
    """
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
    
    # Get all sessions
    all_sessions = db.query(Session).all()
    
    if not all_sessions:
        return {
            "admin_id": admin_id,
            "admin_name": f"{found_admin.first_name} {found_admin.last_name}",
            "total_subjects": 0,
            "total_students": 0,
            "total_absences": 0,
            "subjects": []
        }
    
    # Group data by subject
    subjects_dict = {}
    
    for session in all_sessions:
        if not session.subject:
            continue
            
        subject_id = session.subject_id
        subject_name = session.subject.subject_name
        
        if subject_id not in subjects_dict:
            subjects_dict[subject_id] = {
                "subject_id": subject_id,
                "subject_name": subject_name,
                "sessions": {},
                "total_students": set(),
                "total_absences": 0,
                "total_present": 0
            }
        
        # Get all absences for this session
        session_absences = db.query(Absence).filter(
            Absence.session_id == session.session_id
        ).all()
        
        if session.session_id not in subjects_dict[subject_id]["sessions"]:
            subjects_dict[subject_id]["sessions"][session.session_id] = {
                "session_id": session.session_id,
                "class_id": session.class_id,
                "class_name": session.class_.name if session.class_ else "Unknown",
                "room": session.room.room_name if session.room else "Unknown",
                "day": session.day,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "professor": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else "Unknown",
                "students": []
            }
        
        # Add student absences
        for absence in session_absences:
            student = absence.user
            if student:
                subjects_dict[subject_id]["total_students"].add(student.user_id)
                
                student_data = {
                    "user_id": student.user_id,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "email": student.email,
                    "absence_id": absence.id,
                    "is_absent": absence.is_absent,
                    "date": absence.date.isoformat() if absence.date else None,
                    "recorded_at": absence.date.strftime("%B %d, %Y") if absence.date else "Unknown"
                }
                
                subjects_dict[subject_id]["sessions"][session.session_id]["students"].append(student_data)
                
                if absence.is_absent:
                    subjects_dict[subject_id]["total_absences"] += 1
                else:
                    subjects_dict[subject_id]["total_present"] += 1
    
    # Convert to list format
    subjects_list = []
    total_all_students = set()
    total_all_absences = 0
    
    for subject_data in subjects_dict.values():
        sessions_list = list(subject_data["sessions"].values())
        total_students_in_subject = len(subject_data["total_students"])
        total_all_students.update(subject_data["total_students"])
        total_all_absences += subject_data["total_absences"]
        
        subjects_list.append({
            "subject_id": subject_data["subject_id"],
            "subject_name": subject_data["subject_name"],
            "total_students": total_students_in_subject,
            "total_absences": subject_data["total_absences"],
            "total_present": subject_data["total_present"],
            "total_records": subject_data["total_absences"] + subject_data["total_present"],
            "sessions": sessions_list
        })
    
    # Sort by subject name
    subjects_list.sort(key=lambda x: x["subject_name"])
    
    return {
        "admin_id": admin_id,
        "admin_name": f"{found_admin.first_name} {found_admin.last_name}",
        "total_subjects": len(subjects_list),
        "total_students": len(total_all_students),
        "total_absences": total_all_absences,
        "subjects": subjects_list
    }


def fetch_all_absences_by_subject_director(
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    """
    Fetch all student absences grouped by subject for director
    """
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
    
    # Get all sessions
    all_sessions = db.query(Session).all()
    
    if not all_sessions:
        return {
            "director_id": director_id,
            "director_name": f"{found_director.first_name} {found_director.last_name}",
            "total_subjects": 0,
            "total_students": 0,
            "total_absences": 0,
            "subjects": []
        }
    
    # Group data by subject
    subjects_dict = {}
    
    for session in all_sessions:
        if not session.subject:
            continue
            
        subject_id = session.subject_id
        subject_name = session.subject.subject_name
        
        if subject_id not in subjects_dict:
            subjects_dict[subject_id] = {
                "subject_id": subject_id,
                "subject_name": subject_name,
                "sessions": {},
                "total_students": set(),
                "total_absences": 0,
                "total_present": 0
            }
        
        # Get all absences for this session
        session_absences = db.query(Absence).filter(
            Absence.session_id == session.session_id
        ).all()
        
        if session.session_id not in subjects_dict[subject_id]["sessions"]:
            subjects_dict[subject_id]["sessions"][session.session_id] = {
                "session_id": session.session_id,
                "class_id": session.class_id,
                "class_name": session.class_.name if session.class_ else "Unknown",
                "room": session.room.room_name if session.room else "Unknown",
                "day": session.day,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "professor": f"{session.professor.first_name} {session.professor.last_name}" if session.professor else "Unknown",
                "students": []
            }
        
        # Add student absences
        for absence in session_absences:
            student = absence.user
            if student:
                subjects_dict[subject_id]["total_students"].add(student.user_id)
                
                student_data = {
                    "user_id": student.user_id,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "email": student.email,
                    "absence_id": absence.id,
                    "is_absent": absence.is_absent,
                    "date": absence.date.isoformat() if absence.date else None,
                    "recorded_at": absence.date.strftime("%B %d, %Y") if absence.date else "Unknown"
                }
                
                subjects_dict[subject_id]["sessions"][session.session_id]["students"].append(student_data)
                
                if absence.is_absent:
                    subjects_dict[subject_id]["total_absences"] += 1
                else:
                    subjects_dict[subject_id]["total_present"] += 1
    
    # Convert to list format
    subjects_list = []
    total_all_students = set()
    total_all_absences = 0
    
    for subject_data in subjects_dict.values():
        sessions_list = list(subject_data["sessions"].values())
        total_students_in_subject = len(subject_data["total_students"])
        total_all_students.update(subject_data["total_students"])
        total_all_absences += subject_data["total_absences"]
        
        subjects_list.append({
            "subject_id": subject_data["subject_id"],
            "subject_name": subject_data["subject_name"],
            "total_students": total_students_in_subject,
            "total_absences": subject_data["total_absences"],
            "total_present": subject_data["total_present"],
            "total_records": subject_data["total_absences"] + subject_data["total_present"],
            "sessions": sessions_list
        })
    
    # Sort by subject name
    subjects_list.sort(key=lambda x: x["subject_name"])
    
    return {
        "director_id": director_id,
        "director_name": f"{found_director.first_name} {found_director.last_name}",
        "total_subjects": len(subjects_list),
        "total_students": len(total_all_students),
        "total_absences": total_all_absences,
        "subjects": subjects_list
    }