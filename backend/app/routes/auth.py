from flask import Blueprint, request, jsonify
import bcrypt
from app.models.user import User
from app.extensions import db
import jwt
from datetime import datetime, timedelta
from flask import current_app

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role_code = data.get('role_code', '')

    if not all([name, email, password]):
        return jsonify({'success': False, 'error': {'message': 'Missing fields'}}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': {'message': 'Email already exists'}}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Role Logic
    role = 'PUBLIC'
    if role_code == 'ADMIN999':
        role = 'ADMIN'
    elif role_code == 'FOREST123':
        role = 'DEPARTMENT'

    new_user = User(name=name, email=email, password_hash=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()

    token = jwt.encode({
        'sub': new_user.id,
        'role': new_user.role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'success': True,
        'data': {
            'token': token,
            'user': new_user.to_dict()
        }
    }), 201

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
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'success': True,
        'data': {
            'token': token,
            'user': user.to_dict()
        }
    }), 200
