from fastapi import Depends, HTTPException, Header
from Schemas.messageschema import messages
from Database.connection import connect_databse
from sqlalchemy.orm import Session
from Utils.jwt_handler import verify_token
from Models.Users import Users
from Models.Message import Message



def send_message(data:messages, authorization: str | None = Header(None),db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")


    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    student_id = payload["sub"]

    found_student = db.query(Users).filter(
        Users.user_id == student_id,
        Users.role.in_(["student", "professor","director","administrative"])
    ).first()

    if not found_student:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_message=Message(
        sender_id=student_id,
        receiver_id=data.receiver_id,
        content=data.content
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return{"msg":"sent successfully"}

def fetch_messages(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload["sub"]

    # Verify user exists
    found_user = db.query(Users).filter(Users.user_id == user_id).first()
    if not found_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch all messages where user is either sender or receiver
    messages_list = db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.sent_at.asc()).all()

    # Format the response
    result = []
    for msg in messages_list:
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "content": msg.content,
            "sent_at": msg.sent_at.isoformat() if msg.sent_at else None
        })

    return {"messages": result, "count": len(result)}


def delete_message(message_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = int(payload["sub"])  # Convert to int for comparison

    # Find the message
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    # Check if the user is the sender of the message
    if message.sender_id != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")

    # Delete the message
    db.delete(message)
    db.commit()

    return {"message": "Message deleted successfully"}


def edit_message(message_id: int, new_content: str, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = int(payload["sub"])  # Convert to int for comparison

    # Find the message
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    # Check if the user is the sender of the message
    if message.sender_id != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own messages")

    # Update the message content
    message.content = new_content
    db.commit()
    db.refresh(message)

    return {"message": "Message updated successfully", "updated_content": message.content}
    
    
    
    