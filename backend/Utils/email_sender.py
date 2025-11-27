import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def simple_send(email: str, verification_code: str) -> bool:
    try:
        html = f"""
        <p>Hi 👋 thanks for registering!</p>
        <p>Your verification code is: <b>{verification_code}</b></p>
        """

        message = MessageSchema(
            subject="Verify your account",
            recipients=[email],   
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True
        
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        raise e


async def send_absence_notification(email: str, student_name: str, class_name: str, subject: str, date: str) -> bool:
    """
    Send email notification to student when marked absent
    """
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Absence Notification</h2>
            <p>Dear {student_name},</p>
            <p>This is to inform you that you have been marked <strong>absent</strong> for the following session:</p>
            <ul style="line-height: 1.8;">
                <li><strong>Class:</strong> {class_name}</li>
                <li><strong>Subject:</strong> {subject}</li>
                <li><strong>Date:</strong> {date}</li>
            </ul>
            <p>If you believe this is an error or have a valid reason for your absence, please contact your professor or submit an absence request through the system.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>Academic Administration</p>
        </div>
        """

        message = MessageSchema(
            subject="Absence Notification",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True
        
    except Exception as e:
        print(f"Failed to send absence notification: {str(e)}")
        return False


async def send_absence_request_accepted(email: str, student_name: str, class_name: str, subject: str, date: str) -> bool:
    """
    Send email notification when absence request is accepted
    """
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4caf50;">Absence Request Accepted ✓</h2>
            <p>Dear {student_name},</p>
            <p>Good news! Your absence request has been <strong style="color: #4caf50;">approved</strong>.</p>
            <ul style="line-height: 1.8;">
                <li><strong>Class:</strong> {class_name}</li>
                <li><strong>Subject:</strong> {subject}</li>
                <li><strong>Date:</strong> {date}</li>
            </ul>
            <p>Your absence has been excused and your attendance record has been updated accordingly.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>Academic Administration</p>
        </div>
        """

        message = MessageSchema(
            subject="Absence Request Approved",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True
        
    except Exception as e:
        print(f"Failed to send acceptance notification: {str(e)}")
        return False


async def send_absence_request_rejected(email: str, student_name: str, class_name: str, subject: str, date: str) -> bool:
    """
    Send email notification when absence request is rejected
    """
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Absence Request Rejected ✗</h2>
            <p>Dear {student_name},</p>
            <p>We regret to inform you that your absence request has been <strong style="color: #d32f2f;">rejected</strong>.</p>
            <ul style="line-height: 1.8;">
                <li><strong>Class:</strong> {class_name}</li>
                <li><strong>Subject:</strong> {subject}</li>
                <li><strong>Date:</strong> {date}</li>
            </ul>
            <p>Your absence will remain on your attendance record. If you have any questions or concerns, please contact the academic director.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>Academic Administration</p>
        </div>
        """

        message = MessageSchema(
            subject="Absence Request Rejected",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True
        
    except Exception as e:
        print(f"Failed to send rejection notification: {str(e)}")
        return False


async def send_credentials_email(email: str, first_name: str, last_name: str, password: str) -> bool:
    """
    Send email with login credentials to newly added users
    """
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Welcome to the Academic System!</h2>
            <p>Dear {first_name} {last_name},</p>
            <p>Your account has been successfully created. Below are your login credentials:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Email:</strong> {email}</p>
                <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 3px;">{password}</code></p>
            </div>
            <p style="color: #d32f2f;"><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
            <p>You can now log in to the system using these credentials.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>Academic Administration</p>
        </div>
        """

        message = MessageSchema(
            subject="Your Account Credentials",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return True
        
    except Exception as e:
        print(f"Failed to send credentials email: {str(e)}")
        return False
