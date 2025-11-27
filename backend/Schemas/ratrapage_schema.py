from pydantic import BaseModel
from datetime import date, datetime

class RatrapageSchema(BaseModel):
    user_id: int
    class_id: int
    room_id: int
    department_id: int
    subject_id: int
    date: date
    start_time: datetime
    end_time: datetime
    description: str = None
