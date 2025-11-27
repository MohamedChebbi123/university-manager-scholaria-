from pydantic import BaseModel

class subjectschema(BaseModel):
    subject_name :str
    multiplier : int
    professor_id :int
    department_id:int