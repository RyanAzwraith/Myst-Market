import resend

from app.core.config import get_config
from app.core.exceptions import AppError
from app.features.user.schema import User

from app.features.auth import create_set_password_token

def send_set_password_email(user: User) -> None:
    token = create_set_password_token(user.id)
    link = f"{get_config().cors_origins[0]}/set-password?token={token}"
    try:
        resend.Emails.send( {
            "from": "set_password@resend.dev",
            "to": user.email,
            "subject": "Set Password",
            "html": f"""
            <h1>Set Password</h1>
            <a href="{link}">
                Click to Set Password
            </a>
            <h3> {link} </h3>
            """,
        } )
    except Exception:
        raise AppError("Resend not working")