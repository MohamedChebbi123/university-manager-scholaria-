from Controllers.ratrapage_controller import add_ratrapage, fetch_ratrapages, update_ratrapage, delete_ratrapage, fetch_ratrapages_for_professor
from Schemas.ratrapage_schema import RatrapageSchema
from fastapi import APIRouter, Depends, Header
from Database.connection import connect_databse
from sqlalchemy.orm import Session

router=APIRouter()

@router.post("/add_ratrappage")
def add_ratrapage_as_admin(data: RatrapageSchema, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return add_ratrapage(data,authorization,db)

@router.get("/fetch_ratrapages/{class_id}")
def get_ratrapages(class_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_ratrapages(class_id, authorization, db)

@router.get("/fetch_ratrapages_for_professor")
def get_ratrapages_for_professor(authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return fetch_ratrapages_for_professor(authorization, db)

@router.put("/update_ratrapage/{ratrapage_id}")
def update_ratrapage_route(ratrapage_id: int, data: RatrapageSchema, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return update_ratrapage(ratrapage_id, data, authorization, db)

@router.delete("/delete_ratrapage/{ratrapage_id}")
def delete_ratrapage_route(ratrapage_id: int, authorization: str | None = Header(None), db: Session = Depends(connect_databse)):
    return delete_ratrapage(ratrapage_id, authorization, db)