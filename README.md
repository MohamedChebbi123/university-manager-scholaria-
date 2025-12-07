# Uni Manager Scholaria - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Core Features](#core-features)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Frontend Structure](#frontend-structure)
9. [Installation & Setup](#installation--setup)

---

## Project Overview

**Uni Manager Scholaria** is a comprehensive university management system designed to streamline academic operations, communication, and administrative tasks. The platform provides role-based access control for four distinct user types: Administrators, Directors, Professors, and Students.

### Key Objectives
- Centralized management of academic resources (departments, classes, rooms, sessions)
- Automated attendance tracking and absence management
- Real-time messaging between students and faculty
- Event management and coordination
- Make-up session (ratrapage) scheduling
- Statistical insights and analytics for decision-making

---


### Backend Architecture (MVC Pattern)
```
backend/
├── main.py                    # Application entry point
├── Controllers/               # Business logic layer
├── Routes/                    # API endpoints
├── Models/                    # Database models (ORM)
├── Schemas/                   # Request/Response schemas
├── Utils/                     # Helper utilities
└── Database/                  # Database connection
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Passlib with bcrypt
- **File Storage**: Cloudinary
- **Email**: FastAPI-Mail
- **Data Processing**: Pandas

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)

### DevOps & Deployment
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel
- **Version Control**: Git/GitHub
- **CI/CD**: Vercel automatic deployments

---

## User Roles & Permissions

### 1. Administrator (Admin)
**Highest level access with full system control**

**Capabilities:**
- Create and manage departments
- Assign directors to departments
- Add/remove users (bulk import via CSV)
- Manage all classes, rooms, and sessions
- View comprehensive statistics across all departments
- Moderate and manage events
- Access complete absence history
- Revoke or modify absences
- Send messages to all user types
- Manage user profiles and permissions

### 2. Director
**Department-level management and oversight**

**Capabilities:**
- Manage their assigned department
- Create and manage classes within their department
- Create and allocate rooms
- Manage sessions and schedules
- View department-specific statistics
- Access absence records for their department
- Approve/reject absence justification requests
- Schedule make-up sessions (ratrapage)
- Communicate with professors and students in their department
- View and manage department events

### 3. Professor
**Teaching and classroom management**

**Capabilities:**
- View their assigned classes and sessions
- Take attendance (mark absences)
- View class schedules
- Access student lists and profiles
- Communicate with students
- View events
- Schedule make-up sessions for missed classes
- Access teaching statistics

### 4. Student
**Learning and personal management**

**Capabilities:**
- View their class schedule
- Check personal absence records
- Submit absence justifications with supporting documents
- View and register for events
- Communicate with professors
- View department and class information
- Access make-up session schedules
- View personal profile and statistics

---

## Core Features

### 1. User Management
- **Registration & Authentication**: Secure JWT-based authentication
- **Profile Management**: Upload profile pictures (Cloudinary), update bio, personal information
- **Bulk User Import**: CSV upload for mass user creation
- **Role Assignment**: Dynamic role-based access control
- **Specialty Selection**: Students can choose their specialization
- **Email Notifications**: Automated credential emails on user creation

### 2. Department & Class Management
- **Department Creation**: Admins create departments with directors
- **Class Management**: Directors create classes with capacity limits
- **Room Allocation**: Create and assign rooms to departments
- **Department Statistics**: View enrollment, attendance, and performance metrics

### 3. Session Scheduling
- **Timetable Management**: Create weekly schedules with specific time slots
- **Professor Assignment**: Assign professors to sessions
- **Room Booking**: Allocate rooms for sessions
- **Subject Mapping**: Link sessions to subjects and courses
- **Conflict Detection**: Prevent scheduling conflicts
- **View Schedules**: 
  - Students see their personal schedules
  - Professors see their teaching schedules
  - Directors see department schedules
  - Admins see all schedules

### 4. Attendance & Absence Management
- **Attendance Marking**: Professors mark student absences during sessions
- **Absence Tracking**: Real-time absence recording with timestamps
- **Justification System**: 
  - Students upload absence justifications with documents
  - Directors approve/reject justifications
  - Document storage via Cloudinary
- **Absence History**: 
  - Students view personal history
  - Directors view department history
  - Admins view complete system history
- **Absence Revocation**: Admins can remove incorrect absence records
- **Automated Alerts**: Notifications for excessive absences

### 5. Messaging System
- **One-on-One Messaging**: Real-time text communication
- **Role-Based Messaging**:
  - Student ↔ Professor
  - Student ↔ Director
  - Professor ↔ Director
  - Admin ↔ All users
- **Message Management**: 
  - Edit sent messages
  - Delete messages
  - View conversation history
- **Persistent Storage**: All messages stored in database

### 6. Event Management
- **Event Creation**: Admins create campus-wide events
- **Event Details**: Name, description, type, start/end dates
- **Event Registration**: Students can sign up for events
- **Event Association**: Track attendees via association table
- **Event Moderation**: Admins approve/reject events
- **Event Types**: Academic, social, sports, cultural, etc.
- **My Events**: Users view their registered events

### 7. Make-up Sessions (Ratrapage)
- **Session Scheduling**: Professors/Directors schedule makeup sessions
- **Resource Allocation**: Assign rooms and time slots
- **Student Notification**: Students notified of makeup sessions
- **Department Organization**: Sessions organized by department
- **Subject Tracking**: Link to missed subject material
- **Attendance Tracking**: Track makeup session attendance

### 8. Statistics & Analytics
- **Attendance Statistics**: 
  - Absence rates by student
  - Absence rates by class
  - Absence rates by department
- **Session Statistics**: 
  - Total sessions by professor
  - Sessions by department
  - Session attendance rates
- **Department Analytics**: 
  - Enrollment numbers
  - Class capacities
  - Professor workload
- **Event Analytics**: 
  - Registration counts
  - Event participation rates
- **Dashboard Views**: Role-specific statistical dashboards

---

## Database Schema

### Core Tables

#### Users
```sql
- user_id (PK)
- first_name, last_name
- email (unique), phone_number (unique)
- password_hashed
- role (admin, director, professor, student)
- department, class_name, speciality
- subject (for professors)
- profile_picture, bio
- age, country
- isverified
- joined_at
```

#### Department
```sql
- id (PK)
- dept_name
- description
- profile_picture
- director_id (FK → users)
- created_at
```

#### Classes
```sql
- id (PK)
- name
- capacity
- description
- profile_picture
- department_id (FK → department)
```

#### Rooms
```sql
- room_id (PK)
- room_name
- capacity
- department_id (FK → department)
```

#### Session
```sql
- session_id (PK)
- class_id (FK → classes)
- room_id (FK → rooms)
- professor_id (FK → users)
- subject_id (FK → subjects)
- day (Monday-Sunday)
- start_time, end_time
```

#### Subjects
```sql
- subject_id (PK)
- subject_name
- description
- department_id (FK → department)
- professor_id (FK → users)
```

#### Absence
```sql
- id (PK)
- user_id (FK → users)
- class_id (FK → classes)
- session_id (FK → session)
- date
- is_absent (boolean)
```

#### Demande (Absence Justification)
```sql
- demande_id (PK)
- reason
- document (file URL)
- absence_id (FK → absence)
- is_accepted (boolean)
```

#### Message
```sql
- id (PK)
- sender_id (FK → users)
- receiver_id (FK → users)
- content
- sent_at
```

#### Events
```sql
- event_id (PK)
- event_name (unique)
- details
- event_type
- posted_at
- ends_at
```

#### Event_association
```sql
- id (PK)
- user_id (FK → users)
- event_id (FK → events)
```

#### Ratrapage (Make-up Sessions)
```sql
- id (PK)
- user_id (FK → users)
- class_id (FK → classes)
- room_id (FK → rooms)
- department_id (FK → department)
- subject_id (FK → subjects)
- date
- start_time, end_time
- subject, description
- created_at
```

### Relationships
- **One-to-Many**: 
  - Department → Classes
  - Department → Rooms
  - Department → Subjects
  - Classes → Sessions
  - Users → Absences
  - Users → Sent Messages
  - Users → Received Messages
  
- **Many-to-Many**:
  - Users ↔ Events (via Event_association)

---

## API Documentation

### Base URL
```
Production: https://university-manager-scholaria-6.onrender.com
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### API Endpoints

#### User Management
```
POST   /register                          # User registration
POST   /login                             # User login
POST   /add_users                         # Bulk user creation (Admin)
GET    /fetch_all_users                   # Get all users (Admin)
GET    /user_profile                      # Get current user profile
PUT    /edit_profile                      # Update profile
POST   /change_password                   # Change password
GET    /fetch_professor_for_students      # Get professors for messaging
```

#### Department Management
```
POST   /create_department                 # Create department (Admin)
GET    /fetch_departments                 # Get all departments
GET    /fetch_departments/{id}            # Get single department
PUT    /update_department/{id}            # Update department
DELETE /delete_department/{id}            # Delete department
```

#### Class Management
```
POST   /create_class                      # Create class
GET    /fetch_classes                     # Get all classes
GET    /fetch_classes/{id}                # Get single class
GET    /fetch_classes_by_department/{id}  # Get classes by department
PUT    /update_class/{id}                 # Update class
DELETE /delete_class/{id}                 # Delete class
```

#### Room Management
```
POST   /create_room                       # Create room
GET    /fetch_rooms/{id}                  # Get rooms by department
PUT    /update_room/{id}                  # Update room
DELETE /delete_room/{id}                  # Delete room
```

#### Session Management
```
POST   /add_session                       # Create session
GET    /fetch_sessions/{id}               # Get sessions by class
GET    /fetch_session_for_students        # Get student schedule
GET    /fetch_session_for_professor       # Get professor schedule
GET    /fetch_class_session/{id}          # Get class sessions (Admin)
GET    /fetch_class_session_for_director/{id}  # Director view
GET    /fetch_single_session_for_admin/{id}    # Session details (Admin)
GET    /fetch_single_session_for_director/{id} # Session details (Director)
GET    /fetch_single_session_for_student/{id}  # Session details (Student)
GET    /get_signle_session_info_professor/{id} # Session details (Professor)
GET    /fetch_professors                  # Get all professors
GET    /fetch_subject/{id}                # Get subjects by department
DELETE /delete_session/{session_id}       # Delete session
```

#### Absence Management
```
POST   /mark_absent                       # Mark student absent
GET    /fetch_absences                    # Get absences (filtered by role)
GET    /fetch_absences_by_student         # Student absence history
GET    /fetch_absences_by_class/{id}      # Class absences
GET    /fetch_absences_by_session/{id}    # Session absences
POST   /submit_justification              # Submit absence justification
GET    /fetch_justifications              # Get pending justifications
PUT    /approve_justification/{id}        # Approve justification
PUT    /reject_justification/{id}         # Reject justification
DELETE /revoke_absence/{id}               # Remove absence record (Admin)
```

#### Messaging
```
POST   /send_message                      # Send message
GET    /fetch_messages                    # Get conversation messages
GET    /fetch_conversations               # Get all conversations
PUT    /edit_message/{id}                 # Edit message
DELETE /delete_message/{id}               # Delete message
```

#### Events
```
POST   /create_event                      # Create event (Admin)
GET    /fetch_events                      # Get all events
GET    /fetch_event/{id}                  # Get single event
POST   /register_event                    # Register for event
GET    /my_events                         # Get user's registered events
DELETE /unregister_event/{id}             # Unregister from event
PUT    /moderate_event/{id}               # Approve/reject event (Admin)
```

#### Ratrapage (Make-up Sessions)
```
POST   /create_ratrapage                  # Schedule makeup session
GET    /fetch_ratrapage                   # Get makeup sessions
GET    /fetch_ratrapage_by_class/{id}     # Class makeup sessions
GET    /fetch_ratrapage_by_department/{id}# Department makeup sessions
DELETE /delete_ratrapage/{id}             # Cancel makeup session
```

#### Statistics
```
GET    /stats/attendance                  # Attendance statistics
GET    /stats/department/{id}             # Department statistics
GET    /stats/professor/{id}              # Professor statistics
GET    /stats/student/{id}                # Student statistics
GET    /fetch_sessions_by_department/{department_id}  # Session stats
GET    /class/{class_id}                  # Class statistics
```

#### Specialty & Subject Selection
```
POST   /choose_specialty                  # Student specialty selection
POST   /choose_subject                    # Subject enrollment
GET    /fetch_subjects                    # Get available subjects
```

---

## Frontend Structure

### Page Routes

#### Public Routes
- `/` - Landing page
- `/UserLogin` - Login page
- `/Userregistration` - Registration page

#### Admin Routes
- `/add_users` - Bulk user creation
- `/UsersList` - Manage all users
- `/create_department` - Create departments
- `/fetch_departments` - View all departments
- `/fetch_departments/[id]` - Department details
- `/absence_history_admin` - Complete absence records
- `/absences_revoke` - Revoke absences
- `/events_moderation` - Moderate events
- `/events_moderation/[event_id]` - Event details
- `/message_admin` - Admin messaging
- `/statistics` - System-wide statistics

#### Director Routes
- `/department_directive` - Director dashboard
- `/department_directive/[id]` - Manage department
- `/create_class` - Create classes
- `/create_department` - Department management
- `/absence_history_director` - Department absences
- `/mesage_director` - Director messaging
- `/schedule` - View schedules
- `/statistics` - Department statistics

#### Professor Routes
- `/professor_classes` - View assigned classes
- `/professor_classes/[id]` - Class details
- `/professor_classes/[id]/single_session/[session_id]` - Session management
- `/message_professor` - Communicate with students
- `/my_events` - View events
- `/schedule` - Teaching schedule

#### Student Routes
- `/Student_class` - View class information
- `/Student_class/[session_id]` - Session details
- `/student_absences` - Submit justifications
- `/your_student_absences` - View absence history
- `/choose_specialty` - Select specialization
- `/ChooseSubject` - Enroll in subjects
- `/message_student` - Message professors
- `/user_event` - Browse events
- `/user_event/[event_id]` - Event details
- `/schedule` - Personal schedule

#### Shared Routes
- `/UserProfile` - User profile management

### Key Components
```
components/
├── studentnavbar.tsx       # Navigation for students
├── professornavbar.tsx     # Navigation for professors
├── directornavbar.tsx      # Navigation for directors
├── adminnavbar.tsx         # Navigation for admins
├── Sidebar.tsx             # Side navigation
├── MessageInterface.tsx    # Messaging UI
├── Calendar.tsx            # Schedule calendar
├── AttendanceTable.tsx     # Attendance display
└── StatisticsChart.tsx     # Analytics charts
```

---

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

1. **Clone Repository**
```bash
git clone https://github.com/MohamedChebbi123/university-manager-scholaria-.git
cd university-manager-scholaria-/backend
```

2. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment Variables**
Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/uni_db
SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=your-email@example.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

5. **Run Database Migrations**
```bash
# Tables are auto-created on first run via SQLAlchemy
python main.py
```

6. **Start Backend Server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd ../frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start Development Server**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## Security Features

- **JWT Authentication**: Secure token-based auth with expiration
- **Password Hashing**: Bcrypt hashing for password storage
- **Role-Based Access Control (RBAC)**: Endpoint protection by role
- **CORS Protection**: Configured allowed origins
- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- **Input Validation**: Pydantic schema validation
- **File Upload Security**: Cloudinary secure storage
- **HTTPS**: Enforced in production

---

## Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Exam management module
- [ ] Grade tracking system
- [ ] Parent portal
- [ ] Library management
- [ ] Fee payment integration
- [ ] Video conferencing integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Document version control
- [ ] Automated report generation

---

## Support & Contact

- **Repository**: https://github.com/MohamedChebbi123/university-manager-scholaria-
- **Issues**: https://github.com/MohamedChebbi123/university-manager-scholaria-/issues

---

## License

See LICENSE file for details.

---

**Last Updated**: December 2025
**Version**: 1.0.0
