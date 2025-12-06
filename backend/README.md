# Uni Manager Scholaria - Unified API

This is a unified FastAPI application that consolidates all the microservices into a single application.

## Project Structure

```
uni manager scholaria/
├── main.py                 # Main application entry point
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── LICENSE                # License file
├── Controllers/           # All controller logic
│   ├── UserController.py
│   ├── absence_controller.py
│   ├── events_controller.py
│   ├── ratrapage_controller.py
│   ├── message_controller.py
│   ├── ClassesController.py
│   ├── DepartmentController.py
│   ├── Roomcontroller.py
│   ├── Sessioncontroller.py
│   └── stats_controller.py
├── Routes/                # All API routes
│   ├── UserRoutes.py
│   ├── absence_routes.py
│   ├── events_route.py
│   ├── rartrappage_route.py
│   ├── messages_routes.py
│   ├── ClassesRoute.py
│   ├── DepatementRoute.py
│   ├── UsersRoute.py
│   ├── Roomsroute.py
│   ├── Sessionroute.py
│   └── stats_route.py
├── Models/                # Database models
│   ├── Users.py
│   ├── Absence.py
│   ├── Classes.py
│   ├── Demande.py
│   ├── Department.py
│   ├── Rooms.py
│   ├── Session.py
│   ├── Subjects.py
│   ├── Message.py
│   ├── Events.py
│   ├── Event_association.py
│   └── Ratrapage.py
├── Schemas/               # Pydantic schemas
│   ├── userlogin.py
│   ├── choose_specialty.py
│   ├── choose_subject_bm.py
│   ├── absenceshcema.py
│   ├── event_schema.py
│   ├── ratrapage_schema.py
│   ├── messageschema.py
│   ├── director.py
│   ├── roomscrd.py
│   ├── subjectshcma.py
│   ├── sessionsch.py
│   └── sessionschema.py
├── Utils/                 # Utility functions
│   ├── cloudinary_uploader.py
│   ├── csv_reader.py
│   ├── email_sender.py
│   ├── hasher.py
│   └── jwt_handler.py
└── Database/              # Database connection
    └── connection.py
```

## Services Consolidated

This unified application combines the following previously separate services:

1. **micr1** (Auth Service) - Port 8000
2. **service_ref** (Reference Service) - Port 8001
3. **service_schedule** (Schedule Service) - Port 8003
4. **service_absence** (Absence Service) - Port 8004
5. **service_message** (Message Service) - Port 8005
6. **service_statistique** (Statistics Service) - Port 8006
7. **service_evenement** (Events Service) - Port 8007

All services are now accessible through a single API running on **port 8000**.

## Installation

1. Install dependencies:
```bash
pip install fastapi uvicorn sqlalchemy python-dotenv
```

2. Configure your `.env` file with the database URL and other environment variables.

3. Run the application:
```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once the application is running, you can access:
- Swagger UI: https://university-manager-scholaria-6.onrender.com/docs
- ReDoc: https://university-manager-scholaria-6.onrender.com/redoc

## Features

- **Authentication & Authorization**: User login, registration, and JWT token management
- **Absence Management**: Track and manage student absences
- **Events & Ratrapage**: Manage university events and makeup sessions
- **Messaging**: Internal messaging system
- **References**: Manage departments, classes, rooms, and subjects
- **Scheduling**: Create and manage class sessions
- **Statistics**: Generate reports and statistics

## Notes

- All routes from the previous microservices are preserved
- Database models are consolidated (duplicates removed)
- Single database connection pool for all services
- CORS enabled for all origins (configure as needed for production)
