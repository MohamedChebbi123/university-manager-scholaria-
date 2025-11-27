from typing import Optional
from pydantic import BaseModel


class roomscrd(BaseModel):
    room_id: Optional[int] = None
    room_name: str
    type: str
    department_id: Optional[int] = None