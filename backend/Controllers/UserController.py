from fastapi import Depends,Form,UploadFile,HTTPException,status,Header
from Database.connection import connect_databse
from Utils.cloudinary_uploader import upload_user_profile_image
from Utils.hasher import hash_password,verify_password
from sqlalchemy.orm import Session
from Models.Users import Users
from Models.Classes import Classes
from Schemas.userlogin import userlogin
from Utils.jwt_handler import create_token,verify_token
from Utils.email_sender import send_credentials_email
import pandas as pd


def UserRegistration(
    first_name: str=Form(...),
    last_name: str=Form(...),
    country: str=Form(...),
    email: str=Form(...),
    phone_number: str=Form(...),
    age: str=Form(...),
    password: str=Form(...),
    profile_picture: UploadFile=Form(...),  
    bio: str=Form(...),
    role: str=Form(...),
    db: Session = Depends(connect_databse)
):
    if not first_name.strip() or not last_name.strip():
        raise HTTPException(status_code=400, detail="First name or last name should not be empty")
    if len(password) < 7:
        raise HTTPException(status_code=400, detail="Password should be at least 7 characters")
    if len(phone_number) < 8:
        raise HTTPException(status_code=400, detail="Phone number should be at least 8 digits")
    if '@' not in email or '.' not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email")

    hashed_password = hash_password(password)
    image_url = upload_user_profile_image(profile_picture)
    new_user = Users(
        first_name=first_name,
        last_name=last_name,
        country=country,
        email=email,
        phone_number=phone_number,
        age=age,
        password_hashed=hashed_password,
        profile_picture=image_url,
        bio=bio,
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"msg": "User registered successfully", "user_id": new_user.user_id}


def user_login(cred:userlogin,db:Session=Depends(connect_databse)):
    found_user=db.query(Users).filter(Users.email==cred.email).first()
    
    if not found_user :
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="email not found")
    
    if not verify_password(cred.password, found_user.password_hashed):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="email not found")
    
    payload = {"sub": str(found_user.user_id), "role": found_user.role,"verification":found_user.isverified}
    token = create_token(payload)
    print(token)
    print(found_user.role)
    print(found_user.isverified)
    
    return {
        "token": token,
        "token_type": "bearer",
        "role": found_user.role,
        "verification" : found_user.isverified,
        "message": f"{found_user.role} logged in successfully"
    }
    

def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    authorization: str = None,
    db: Session = Depends(connect_databse)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    # Import jwt_handler for token verification
    from Utils.jwt_handler import verify_token
    payload = verify_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    # Find the user
    found_user = db.query(Users).filter(Users.user_id == user_id).first()
    
    if not found_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify old password
    if not verify_password(old_password, found_user.password_hashed):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password
    if len(new_password) < 7:
        raise HTTPException(status_code=400, detail="New password must be at least 7 characters")
    
    # Hash and update password
    hashed_password = hash_password(new_password)
    found_user.password_hashed = hashed_password
    
    db.commit()
    
    return {"message": "Password changed successfully"}


async def add_users(file: UploadFile = Form(...), db: Session = Depends(connect_databse), authorization: str | None = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin_id = payload["sub"]

    admin = db.query(Users).filter(
        Users.user_id == admin_id,
        Users.isverified == "true",
        Users.role == "administrative"
    ).first()

    if not admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="you are not supposed to come here")

    try:
        data = pd.read_csv(file.file)
        required_cols = ["first_name", "last_name", "department", "email", 
                          "password_hashed",  "role", "class_name"]
        for col in required_cols:
            if col not in data.columns:
                raise HTTPException(status_code=400, detail=f"Missing column: {col}")

        users_added = 0
        emails_sent = 0
        for _, row in data.iterrows():
            plain_password = str(row["password_hashed"])
            hashed_password = hash_password(plain_password)

            new_user = Users(
                first_name=row["first_name"],
                last_name=row["last_name"],
                email=row["email"],
                password_hashed=hashed_password,
                role=row["role"],
                department=row["department"],
                class_name=row["class_name"]
            )
            db.add(new_user)
            users_added += 1
            db.flush()
            
            found_class = db.query(Classes).filter(Classes.name == row["class_name"]).first()
            if found_class:
               new_user.class_id = found_class.id
            
            try:
                await send_credentials_email(
                    email=row["email"],
                    first_name=row["first_name"],
                    last_name=row["last_name"],
                    password=plain_password
                )
                emails_sent += 1
            except Exception as email_error:
                print(f"Failed to send email to {row['email']}: {str(email_error)}")
                
        db.commit()
        return {
            "msg": f"{users_added} users added successfully",
            "emails_sent": f"{emails_sent} credential emails sent"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def user_profile(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    found_user = db.query(Users).filter(Users.user_id == user_id).first()
    
    return {
        "user_id": found_user.user_id,
        "first_name": found_user.first_name,
        "last_name": found_user.last_name,
        "country": found_user.country,
        "email": found_user.email,
        "phone_number": found_user.phone_number,
        "age": found_user.age,
        "verification": found_user.isverified,
        "profile_picture": found_user.profile_picture,
        "joined_at": found_user.joined_at,
        "bio": found_user.bio,
        "role": found_user.role
    }


def fetch_users(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload["sub"]
    admin = (
        db.query(Users)
        .filter(
            Users.user_id == user_id,
            Users.isverified == "true",
            Users.role == "administrative"
        )
        .first()  
    )
    if not admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="you are not supposed to come here")
    found_users = db.query(Users).all()
    
    return [
        {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "country": user.country,
            "email": user.email,
            "phone_number": user.phone_number,
            "age": user.age,
            "subject": user.subject,
            "profile_picture": user.profile_picture,
            "joined_at": user.joined_at,
            "bio": user.bio,
            "verifed": user.isverified,
            "role": user.role,
        }
        for user in found_users
    ]


def edit_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    country: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    age: str = Form(...),
    profile_picture: UploadFile = Form(None),  
    bio: str = Form(...),
    db: Session = Depends(connect_databse),
    authorization: str | None = Header(None)
):
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload["sub"]
    
    found_user = db.query(Users).filter(Users.user_id == user_id).first()
    
    if profile_picture:
        image_url = upload_user_profile_image(profile_picture)
        found_user.profile_picture = image_url
    
    found_user.first_name = first_name
    found_user.last_name = last_name
    found_user.country = country
    found_user.email = email
    found_user.phone_number = phone_number
    found_user.age = age
    found_user.bio = bio
    
    db.commit()
    db.refresh(found_user)
    
    return {"message": "user profile has been updated"}
    