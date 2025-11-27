from fastapi import Depends, HTTPException, Header
from grpc import Status
from Database.connection import connect_databse
from sqlalchemy.orm import Session as DBSession, joinedload
from sqlalchemy import func, distinct
from Models.Session import Session
from Models.Classes import Classes
from Models.Subjects import Subjects
from Models.Users import Users
from Models.Rooms import Room
from Models.Department import Department
from Models.Absence import Absence
from Utils.jwt_handler import verify_token


def fetch_sessions_for_department(department_id: int, authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]

    found_admin = db.query(Users).filter(Users.user_id == admin_id, Users.role.in_(["administrative", "director"])).first()

    if not found_admin:
        raise HTTPException(status_code=403, detail="Only administrators can view event attendees")

    sessions = db.query(Session).join(
        Classes, Session.class_id == Classes.id
    ).join(
        Subjects, Session.subject_id == Subjects.subject_id
    ).join(
        Users, Session.professor_id == Users.user_id
    ).join(
        Room, Session.room_id == Room.room_id
    ).filter(
        Classes.department_id == department_id
    ).options(
        joinedload(Session.class_),
        joinedload(Session.subject),
        joinedload(Session.professor),
        joinedload(Session.room)
    ).all()

    result = []
    for session in sessions:
        result.append({
            "session_id": session.session_id,
            "day": session.day,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "subject_name": session.subject.subject_name,
            "room_name": session.room.room_name,
            "professor_name": f"{session.professor.first_name} {session.professor.last_name}" if session.professor.first_name and session.professor.last_name else "Unknown",
            "professor_id": session.professor.user_id,
            "class_name": session.class_.name,
            "class_id": session.class_.id
        })

    return {
        "success": True,
        "department_id": department_id,
        "total_sessions": len(result),
        "sessions": result
    }


def delete_session(session_id: int, authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]

    found_admin = db.query(Users).filter(Users.user_id == admin_id, Users.role.in_(["administrative", "director"])).first()

    if not found_admin:
        raise HTTPException(status_code=403, detail="Only administrators can delete sessions")

    session = db.query(Session).filter(Session.session_id == session_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()

    return {
        "success": True,
        "message": "Session deleted successfully",
        "session_id": session_id
    }


def get_class_statistics(class_id: int, authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload["sub"]
    found_user = db.query(Users).filter(
        Users.user_id == user_id,
        Users.role.in_(["administrative", "director"])
    ).first()

    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get class info
    class_info = db.query(Classes).filter(Classes.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=404, detail="Class not found")

    # Count total students in the class
    total_students = db.query(func.count(Users.user_id)).join(
        Classes, Users.class_name == Classes.name
    ).filter(
        Classes.id == class_id,
        Users.role == "student"
    ).scalar()

    # Count total sessions for the class
    total_sessions = db.query(func.count(Session.session_id)).filter(
        Session.class_id == class_id
    ).scalar()

    # Count total absences for the class
    total_absences = db.query(func.count(Absence.id)).filter(
        Absence.class_id == class_id,
        Absence.is_absent == True
    ).scalar()

    # Get absence rate per student
    student_absence_stats = db.query(
        Users.user_id,
        Users.first_name,
        Users.last_name,
        func.count(Absence.id).label("absence_count")
    ).join(
        Absence, Users.user_id == Absence.user_id
    ).join(
        Classes, Users.class_name == Classes.name
    ).filter(
        Classes.id == class_id,
        Users.role == "student",
        Absence.is_absent == True
    ).group_by(
        Users.user_id,
        Users.first_name,
        Users.last_name
    ).all()

    # Get subjects taught in this class
    subjects_in_class = db.query(
        Subjects.subject_id,
        Subjects.subject_name,
        func.count(Session.session_id).label("session_count")
    ).join(
        Session, Subjects.subject_id == Session.subject_id
    ).filter(
        Session.class_id == class_id
    ).group_by(
        Subjects.subject_id,
        Subjects.subject_name
    ).all()

    return {
        "success": True,
        "class_id": class_id,
        "class_name": class_info.name,
        "capacity": class_info.capacity,
        "department_id": class_info.department_id,
        "total_students": total_students,
        "total_sessions": total_sessions,
        "total_absences": total_absences,
        "absence_rate": round((total_absences / (total_students * total_sessions)) * 100, 2) if total_students > 0 and total_sessions > 0 else 0,
        "student_absence_stats": [
            {
                "user_id": stat.user_id,
                "name": f"{stat.first_name} {stat.last_name}",
                "absence_count": stat.absence_count,
                "absence_rate": round((stat.absence_count / total_sessions) * 100, 2) if total_sessions > 0 else 0
            }
            for stat in student_absence_stats
        ],
        "subjects": [
            {
                "subject_id": subj.subject_id,
                "subject_name": subj.subject_name,
                "session_count": subj.session_count
            }
            for subj in subjects_in_class
        ]
    }


def get_department_statistics(department_id: int, authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
    """Get comprehensive statistics for a specific department"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload["sub"]
    found_user = db.query(Users).filter(
        Users.user_id == user_id,
        Users.role.in_(["administrative", "director"])
    ).first()

    if not found_user:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get department info
    dept_info = db.query(Department).filter(Department.id == department_id).first()
    if not dept_info:
        raise HTTPException(status_code=404, detail="Department not found")

    # Count total classes
    total_classes = db.query(func.count(Classes.id)).filter(
        Classes.department_id == department_id
    ).scalar()

    # Count total students in all classes of the department
    total_students = db.query(func.count(Users.user_id)).join(
        Classes, Users.class_name == Classes.name
    ).filter(
        Classes.department_id == department_id,
        Users.role == "student"
    ).scalar()

    # Count total professors teaching in the department
    total_professors = db.query(func.count(distinct(Subjects.professor_id))).filter(
        Subjects.department_id == department_id
    ).scalar()

    # Count total subjects
    total_subjects = db.query(func.count(Subjects.subject_id)).filter(
        Subjects.department_id == department_id
    ).scalar()

    # Count total sessions
    total_sessions = db.query(func.count(Session.session_id)).join(
        Classes, Session.class_id == Classes.id
    ).filter(
        Classes.department_id == department_id
    ).scalar()

    # Count total absences
    total_absences = db.query(func.count(Absence.id)).join(
        Classes, Absence.class_id == Classes.id
    ).filter(
        Classes.department_id == department_id,
        Absence.is_absent == True
    ).scalar()

    # Get statistics per class
    class_stats = db.query(
        Classes.id,
        Classes.name,
        func.count(distinct(Users.user_id)).label("student_count"),
        func.count(distinct(Session.session_id)).label("session_count")
    ).outerjoin(
        Users, Classes.name == Users.class_name
    ).outerjoin(
        Session, Classes.id == Session.class_id
    ).filter(
        Classes.department_id == department_id
    ).group_by(
        Classes.id,
        Classes.name
    ).all()

    # Get absence statistics per class
    class_absence_stats = db.query(
        Classes.id,
        func.count(Absence.id).label("absence_count")
    ).join(
        Absence, Classes.id == Absence.class_id
    ).filter(
        Classes.department_id == department_id,
        Absence.is_absent == True
    ).group_by(
        Classes.id
    ).all()

    absence_dict = {stat.id: stat.absence_count for stat in class_absence_stats}

    # Get subject statistics
    subject_stats = db.query(
        Subjects.subject_id,
        Subjects.subject_name,
        Users.first_name,
        Users.last_name,
        func.count(Session.session_id).label("session_count")
    ).join(
        Users, Subjects.professor_id == Users.user_id
    ).outerjoin(
        Session, Subjects.subject_id == Session.subject_id
    ).filter(
        Subjects.department_id == department_id
    ).group_by(
        Subjects.subject_id,
        Subjects.subject_name,
        Users.first_name,
        Users.last_name
    ).all()

    return {
        "success": True,
        "department_id": department_id,
        "department_name": dept_info.dept_name,
        "description": dept_info.description,
        "total_classes": total_classes,
        "total_students": total_students,
        "total_professors": total_professors,
        "total_subjects": total_subjects,
        "total_sessions": total_sessions,
        "total_absences": total_absences,
        "overall_absence_rate": round((total_absences / (total_students * total_sessions)) * 100, 2) if total_students > 0 and total_sessions > 0 else 0,
        "classes": [
            {
                "class_id": cls.id,
                "class_name": cls.name,
                "student_count": cls.student_count,
                "session_count": cls.session_count,
                "absence_count": absence_dict.get(cls.id, 0),
                "absence_rate": round((absence_dict.get(cls.id, 0) / (cls.student_count * cls.session_count)) * 100, 2) if cls.student_count > 0 and cls.session_count > 0 else 0
            }
            for cls in class_stats
        ],
        "subjects": [
            {
                "subject_id": subj.subject_id,
                "subject_name": subj.subject_name,
                "professor_name": f"{subj.first_name} {subj.last_name}",
                "session_count": subj.session_count
            }
            for subj in subject_stats
        ]
    }


def get_all_departments_statistics(authorization: str | None = Header(None), db: DBSession = Depends(connect_databse)):
    """Get overview statistics for all departments"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload["sub"]
    found_user = db.query(Users).filter(
        Users.user_id == user_id,
        Users.role == "administrative"
    ).first()

    if not found_user:
        raise HTTPException(status_code=403, detail="Only administrators can view all department statistics")

    # Get all departments
    departments = db.query(Department).all()

    dept_stats = []
    for dept in departments:
        # Count classes
        class_count = db.query(func.count(Classes.id)).filter(
            Classes.department_id == dept.id
        ).scalar()

        # Count students
        student_count = db.query(func.count(Users.user_id)).join(
            Classes, Users.class_name == Classes.name
        ).filter(
            Classes.department_id == dept.id,
            Users.role == "student"
        ).scalar()

        # Count professors
        professor_count = db.query(func.count(distinct(Subjects.professor_id))).filter(
            Subjects.department_id == dept.id
        ).scalar()

        # Count subjects
        subject_count = db.query(func.count(Subjects.subject_id)).filter(
            Subjects.department_id == dept.id
        ).scalar()

        # Count sessions
        session_count = db.query(func.count(Session.session_id)).join(
            Classes, Session.class_id == Classes.id
        ).filter(
            Classes.department_id == dept.id
        ).scalar()

        # Count absences
        absence_count = db.query(func.count(Absence.id)).join(
            Classes, Absence.class_id == Classes.id
        ).filter(
            Classes.department_id == dept.id,
            Absence.is_absent == True
        ).scalar()

        dept_stats.append({
            "department_id": dept.id,
            "department_name": dept.dept_name,
            "profile_picture": dept.profile_picture,
            "total_classes": class_count,
            "total_students": student_count,
            "total_professors": professor_count,
            "total_subjects": subject_count,
            "total_sessions": session_count,
            "total_absences": absence_count,
            "absence_rate": round((absence_count / (student_count * session_count)) * 100, 2) if student_count > 0 and session_count > 0 else 0
        })

    return {
        "success": True,
        "total_departments": len(departments),
        "departments": dept_stats
    }