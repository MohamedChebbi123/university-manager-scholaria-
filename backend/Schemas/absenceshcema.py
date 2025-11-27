from pydantic import BaseModel

class absenceschema(BaseModel):
    user_id:int
    class_id:int
    session_id:int
    is_absent:bool