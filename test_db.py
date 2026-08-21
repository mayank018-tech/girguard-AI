import os
import uuid
import bcrypt
from datetime import datetime
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("postgresql://postgres:Mayank647418@db.xlooknlgsqunvzbbzoux.supabase.co:5432/postgres")
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime)

Session = sessionmaker(bind=engine)
session = Session()

try:
    user = User(
        id=f"USR-{uuid.uuid4().hex[:8]}",
        name="Test",
        email="testdb@test.com",
        password_hash="test",
        role="PUBLIC",
        created_at=datetime.utcnow()
    )
    session.add(user)
    session.commit()
    print("Success")
except Exception as e:
    print(f"Error: {e}")
