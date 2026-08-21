from datetime import datetime
import uuid
from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(50), primary_key=True, default=lambda: f"USR-{uuid.uuid4().hex[:8]}")
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="PUBLIC") # 'PUBLIC', 'DEPARTMENT', 'ADMIN'
    account_status = db.Column(db.String(20), nullable=False, default="ACTIVE") # 'ACTIVE', 'PENDING', 'SUSPENDED'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "department": self.department,
            "designation": self.designation,
            "role": self.role,
            "account_status": self.account_status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
