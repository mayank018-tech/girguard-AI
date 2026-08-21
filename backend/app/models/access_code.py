import uuid
from datetime import datetime, timedelta
from app.extensions import db

class AccessCode(db.Model):
    __tablename__ = 'access_codes'

    id = db.Column(db.String(50), primary_key=True, default=lambda: f"AC-{uuid.uuid4().hex[:8]}")
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    role_type = db.Column(db.String(20), nullable=False) # 'DEPARTMENT' or 'ADMIN'
    status = db.Column(db.String(20), nullable=False, default='ACTIVE') # 'ACTIVE', 'USED', 'REVOKED', 'EXPIRED'
    created_by = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=7))
    used_at = db.Column(db.DateTime, nullable=True)
    used_by = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True)

    creator = db.relationship('User', foreign_keys=[created_by], backref='generated_codes')
    user = db.relationship('User', foreign_keys=[used_by], backref='used_code')

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "role_type": self.role_type,
            "status": self.status,
            "created_by": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "used_at": self.used_at.isoformat() if self.used_at else None,
            "used_by": self.user.name if self.user else None
        }
