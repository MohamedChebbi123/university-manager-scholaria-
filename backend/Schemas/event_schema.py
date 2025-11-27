from pydantic import BaseModel
from datetime import date

class EventSchema(BaseModel):
    event_name: str
    ends_at: date
    details: str
    event_type: str