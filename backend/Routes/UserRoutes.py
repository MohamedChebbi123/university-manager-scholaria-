from fastapi import APIRouter, Depends, File, Form, UploadFile, Header
from Controllers.UserController import UserRegistration,user_login,change_password
from Database.connection import connect_databse
from sqlalchemy.orm import Session
from Schemas.userlogin import userlogin



router=APIRouter()

@router.post("/user_registration")
def register_as_a_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    country: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    age: str = Form(...),
    password: str = Form(...),  
    profile_picture: UploadFile = File(...), 
    bio: str = Form(...),
    role: str = Form(...),
    db: Session = Depends(connect_databse)):
    return  UserRegistration(
        first_name,
        last_name,
        country,
        email,
        phone_number,
        age,
        password,
        profile_picture,
        bio,
        role,
        db
    )


@router.post("/user_login")
def login_as_a_user(cred:userlogin,db:Session=Depends(connect_databse)):
    return user_login(cred,db)

@router.put("/change_password")
def change_user_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    authorization: str = Header(None),
    db: Session = Depends(connect_databse)
):
    return change_password(old_password, new_password, authorization, db)

