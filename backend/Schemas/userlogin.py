from pydantic import BaseModel

class userlogin(BaseModel):
    email:str
    password:str