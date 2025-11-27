from fastapi import APIRouter, Header ,Depends
from sqlalchemy.orm import Session
from Controllers.Roomcontroller import add_rooms_to_department,fetch_rooms_of_department
from Database.connection import connect_databse
from Schemas.roomscrd import roomscrd
router=APIRouter()


@router.post("/fetch_single_department/{id}/add_room")
def add_room_as_admin(
    data: roomscrd,
    id: int,
    authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)
):
    return add_rooms_to_department(data, id, authorization, db)


@router.get("/fetch_single_department/{id}/fetch_rooms")
def fetch_rooms_in_dept_as_admin(id:int,authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    
    return fetch_rooms_of_department(id,authorization,db)