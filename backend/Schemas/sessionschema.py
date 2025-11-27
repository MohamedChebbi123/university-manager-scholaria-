from pydantic import BaseModel

class sessionschema(BaseModel):
    class_id: int
    room_id: int
    professor_id: int
    subject_id: int
    start_time: str
    end_time: str
    day:str