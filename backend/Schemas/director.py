from pydantic import BaseModel
 
class directorcredentials(BaseModel):
    first_name :str
    last_name :str
    email :str
    phone_number :str
    password_hashed :str