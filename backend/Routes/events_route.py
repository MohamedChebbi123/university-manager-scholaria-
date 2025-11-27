from Controllers.events_controller import add_event, fetch_events, fetch_event_by_id, update_event, delete_event, add_event_for_user, remove_event_for_user, fetch_user_events, fetch_event_attendees
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from Schemas.event_schema import EventSchema
from  Database.connection import connect_databse



router=APIRouter()

@router.post("/add_event")
def add_event_as_admin(data:EventSchema,authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return add_event(data,authorization,db)

@router.get("/fetch_events")
def get_all_events(authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return fetch_events(authorization,db)

@router.get("/fetch_event/{event_id}")
def get_event_by_id(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_event_by_id(event_id, authorization, db)

@router.put("/update_event/{event_id}")
def update_event_by_id(event_id: int, data: EventSchema, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return update_event(event_id, data, authorization, db)

@router.delete("/delete_event/{event_id}")
def delete_event_by_id(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return delete_event(event_id, authorization, db)

@router.post("/register_event/{event_id}")
def register_user_for_event(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return add_event_for_user(event_id, authorization, db)

@router.delete("/unregister_event/{event_id}")
def unregister_user_from_event(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return remove_event_for_user(event_id, authorization, db)

@router.get("/my_events")
def get_user_registered_events(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_user_events(authorization, db)

@router.get("/event_attendees/{event_id}")
def get_event_attendees(event_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_event_attendees(event_id, authorization, db)