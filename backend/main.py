from Models import Users
from Models import Department
from Models import Classes
from Models import Subjects
from Models import Rooms
from Models import Session
from Models import Absence
from Models import Demande
from Models import Message
from Models import Events
from Models import Event_association
from Models import Ratrapage

from Routes import UserRoutes
from Routes import absence_routes
from Routes import events_route
from Routes import rartrappage_route
from Routes import messages_routes
from Routes import ClassesRoute
from Routes import DepatementRoute
from Routes import UsersRoute
from Routes import Roomsroute
from Routes import Sessionroute
from Routes import stats_route

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from Database.connection import engine, Base

app = FastAPI(title="Uni Manager Scholaria - Unified API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(UserRoutes.router)


app.include_router(absence_routes.router)


app.include_router(events_route.router)
app.include_router(rartrappage_route.router)


app.include_router(messages_routes.router)


app.include_router(DepatementRoute.router)
app.include_router(ClassesRoute.router)
app.include_router(UsersRoute.router)
app.include_router(Roomsroute.router)


app.include_router(Sessionroute.router)

app.include_router(stats_route.router)

Base.metadata.create_all(bind=engine)

