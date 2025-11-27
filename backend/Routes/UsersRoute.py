from fastapi import APIRouter, Depends, Form, Header, UploadFile
from Database.connection import connect_databse
from sqlalchemy.orm import Session
from Controllers.UserController import add_users, edit_profile,fetch_users,user_profile
from Controllers.DepartmentController import fetch_professors_students



router=APIRouter()

@router.post("/add_users")
async def add_users_as_admin(file: UploadFile = Form(...), db: Session = Depends(connect_databse),authorization: str | None = Header(None)):
    return await add_users(file,db,authorization)

@router.get("/fetch_all_users")
def fetch_users_as_admin(authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    return fetch_users(authorization,db)

@router.get("/user_profile")
def view_profile_as_a_user(authorization: str | None = Header(None),db:Session=Depends(connect_databse)):
    return user_profile(authorization,db)

@router.put("/edit_profile")
def edit_profile_as_a_user(first_name: str=Form(...),
    last_name: str=Form(...),
    country: str=Form(...),
    email: str=Form(...),
    phone_number: str=Form(...),
    age: str=Form(...),
    profile_picture: UploadFile=Form(None),  
    bio: str=Form(...),
    db: Session = Depends(connect_databse),
    authorization: str | None = Header(None)):
    
    return edit_profile(first_name,
    last_name,
    country,
    email,
    phone_number,
    age,
    profile_picture,  
    bio,
    db,
    authorization)
    
    
@router.get("/fetch_professor_for_students")
def fetch_professors_for_students(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
   return fetch_professors_students(authorization,db)