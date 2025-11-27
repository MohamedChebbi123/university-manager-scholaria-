from pydantic import BaseModel
from datetime import time


class sessionsch(BaseModel):
    class_id: int
    room_id: int
    professor_id: int
    subject_id: int
    start_time: time
    end_time: time