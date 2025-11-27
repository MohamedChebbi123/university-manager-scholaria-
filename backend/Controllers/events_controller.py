from Database.connection import connect_databse
from sqlalchemy.orm import Session
from fastapi import HTTPException, Header,Depends,status
from Utils.jwt_handler import verify_token
from Models.Users import Users
from Models.Events import Events
from Models.Event_association import Event_association
from Schemas.event_schema import EventSchema

def add_event(data:EventSchema,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")


    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin=db.query(Users).filter(Users.user_id==admin_id,Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN,detail="dont come here ")
    
    # Check if event with same name already exists
    existing_event = db.query(Events).filter(Events.event_name == data.event_name).first()
    if existing_event:
        raise HTTPException(status_code=400, detail="Event with this name already exists")
    
    # Create new event
    new_event = Events(
        event_name=data.event_name,
        ends_at=data.ends_at,
        details=data.details,
        event_type=data.event_type
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return{
        "message": "Event created successfully",
        "event_id": new_event.event_id,
        "event_name": new_event.event_name,
        "posted_at": new_event.posted_at,
        "ends_at": new_event.ends_at,
        "details": new_event.details,
        "event_type": new_event.event_type
    }
    
def fetch_events(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")


    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin=db.query(Users).filter(Users.user_id==admin_id).first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN,detail="dont come here ")
    
    events = db.query(Events).all()
    
    return {
        "events": [
            {
                "event_id": event.event_id,
                "event_name": event.event_name,
                "posted_at": event.posted_at,
                "ends_at": event.ends_at,
                "details": event.details,
                "event_type": event.event_type
            }
            for event in events
        ]
    }

def fetch_event_by_id(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin = db.query(Users).filter(Users.user_id == admin_id).first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="dont come here ")
    
    event = db.query(Events).filter(Events.event_id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {
        "event_id": event.event_id,
        "event_name": event.event_name,
        "posted_at": event.posted_at,
        "ends_at": event.ends_at,
        "details": event.details,
        "event_type": event.event_type
    }

def update_event(event_id: int, data: EventSchema, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin = db.query(Users).filter(Users.user_id == admin_id,Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="dont come here ")
    
    event = db.query(Events).filter(Events.event_id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if updating event name to an existing name
    if data.event_name != event.event_name:
        existing_event = db.query(Events).filter(Events.event_name == data.event_name).first()
        if existing_event:
            raise HTTPException(status_code=400, detail="Event with this name already exists")
    
    # Update fields
    event.event_name = data.event_name
    event.ends_at = data.ends_at
    event.details = data.details
    event.event_type = data.event_type
    
    db.commit()
    db.refresh(event)
    
    return {
        "message": "Event updated successfully",
        "event_id": event.event_id,
        "event_name": event.event_name,
        "posted_at": event.posted_at,
        "ends_at": event.ends_at,
        "details": event.details,
        "event_type": event.event_type
    }

def delete_event(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    found_admin = db.query(Users).filter(Users.user_id == admin_id, Users.role=="administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="dont come here ")
    
    event = db.query(Events).filter(Events.event_id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    
    return {
        "message": "Event deleted successfully",
        "event_id": event_id
    }

def add_event_for_user(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
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
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="User not found")
    
    # Check if event exists
    event = db.query(Events).filter(Events.event_id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user is already registered for this event
    existing_registration = db.query(Event_association).filter(
        Event_association.user_id == user_id,
        Event_association.event_id == event_id
    ).first()
    
    if existing_registration:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
    
    # Create new event association
    new_registration = Event_association(
        user_id=user_id,
        event_id=event_id
    )
    
    db.add(new_registration)
    db.commit()
    
    return {
        "message": "Successfully registered for the event",
        "event_id": event_id,
        "event_name": event.event_name,
        "user_id": user_id
    }

def remove_event_for_user(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
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
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="User not found")
    
    # Check if registration exists
    registration = db.query(Event_association).filter(
        Event_association.user_id == user_id,
        Event_association.event_id == event_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="You are not registered for this event")
    
    db.delete(registration)
    db.commit()
    
    return {
        "message": "Successfully unregistered from the event",
        "event_id": event_id,
        "user_id": user_id
    }

def fetch_user_events(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
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
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="User not found")
    
    # Fetch all events the user is registered for
    user_registrations = db.query(Event_association).filter(
        Event_association.user_id == user_id
    ).all()
    
    registered_events = []
    for registration in user_registrations:
        event = db.query(Events).filter(Events.event_id == registration.event_id).first()
        if event:
            registered_events.append({
                "event_id": event.event_id,
                "event_name": event.event_name,
                "posted_at": event.posted_at,
                "ends_at": event.ends_at,
                "details": event.details,
                "event_type": event.event_type
            })
    
    return {
        "message": "User registered events fetched successfully",
        "events": registered_events
    }
    
def fetch_event_attendees(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]
    
    # Check if user is admin
    found_admin = db.query(Users).filter(Users.user_id == admin_id, Users.role == "administrative").first()
    
    if not found_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Only administrators can view event attendees")
    
    # Check if event exists
    event = db.query(Events).filter(Events.event_id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Fetch all attendees for this event
    attendees_registrations = db.query(Event_association).filter(
        Event_association.event_id == event_id
    ).all()
    
    attendees_list = []
    for registration in attendees_registrations:
        user = db.query(Users).filter(Users.user_id == registration.user_id).first()
        if user:
            attendees_list.append({
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture":user.profile_picture,
                "email": user.email,
                "role": user.role
            })
    
    return {
        "message": "Event attendees fetched successfully",
        "event_id": event_id,
        "event_name": event.event_name,
        "total_attendees": len(attendees_list),
        "attendees": attendees_list
    }