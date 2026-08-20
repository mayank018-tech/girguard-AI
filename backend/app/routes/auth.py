from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from app.utils.auth import get_jwt_secret, require_auth
import bcrypt
import jwt
from datetime import datetime, timedelta

bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role_code = data.get('role_code', '') # Secret code for dept role

    if not all([name, email, password]):
        return jsonify({'success': False, 'error': {'message': 'Missing fields'}}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': {'message': 'Email already exists'}}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    role = 'DEPARTMENT' if role_code == 'FOREST123' else 'PUBLIC'

    new_user = User(name=name, email=email, password_hash=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True, 'data': new_user.to_dict()}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'success': False, 'error': {'message': 'Invalid credentials'}}), 401

    token = jwt.encode({
        'sub': user.id,
        'exp': datetime.utcnow() + timedelta(days=7),
        'role': user.role
    }, get_jwt_secret(), algorithm='HS256')

    return jsonify({'success': True, 'data': {'token': token, 'user': user.to_dict()}})

@bp.route('/me', methods=['GET'])
@require_auth
def get_me():
    return jsonify({'success': True, 'data': request.user.to_dict()})
