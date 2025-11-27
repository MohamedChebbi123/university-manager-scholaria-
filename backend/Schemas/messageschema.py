from pydantic import BaseModel

class messages(BaseModel):
    sender_id:int
    receiver_id:int
    content:str