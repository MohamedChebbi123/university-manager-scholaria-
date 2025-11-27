from Database.connection import connect_databse
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from Models.Users import Users
from Utils.jwt_handler import verify_token
from Schemas.roomscrd import roomscrd
from Models.Rooms import Room


def add_rooms_to_department(
    data: roomscrd,
    id: int,
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
    found_admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.role == "administrative"
    ).first()
    if not found_admin:
        raise HTTPException(status_code=401, detail="Not authorized")
    new_room = Room(
        room_name = data.room_name,
        department_id = id,
        type = data.type
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return {
        "msg": f"Room '{new_room.room_name}' inserted successfully",
        "room_id": new_room.room_id
    }
    
def fetch_rooms_of_department(id:int,authorization: str | None = Header(None),
    db: Session = Depends(connect_databse)):
    
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
    
    