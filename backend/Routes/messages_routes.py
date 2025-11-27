from Schemas.messageschema import messages
from fastapi import Depends, HTTPException, Header,APIRouter
from Schemas.messageschema import messages
from Database.connection import connect_databse
from sqlalchemy.orm import Session
from Utils.jwt_handler import verify_token
from Models.Users import Users
from Models.Message import Message
from Controllers.message_controller import send_message, fetch_messages, delete_message, edit_message
from pydantic import BaseModel

class EditMessageRequest(BaseModel):
    content: str

router=APIRouter()

@router.post("/send_message_users")
def send_message_users(data:messages, authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    return send_message(data,authorization,db)

@router.get("/fetch_messages")
def get_messages(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_messages(authorization, db)

@router.delete("/delete_message/{message_id}")
def delete_message_route(message_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return delete_message(message_id, authorization, db)

@router.put("/edit_message/{message_id}")
def edit_message_route(message_id: int, data: EditMessageRequest, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return edit_message(message_id, data.content, authorization, db)