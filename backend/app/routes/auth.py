from flask import Blueprint, request, jsonify
import bcrypt
from app.models.user import User
from app.models.access_code import AccessCode
from app.extensions import db
import jwt
from datetime import datetime, timedelta
from flask import current_app

bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role', 'PUBLIC')
    access_code_str = data.get('access_code')
    department = data.get('department')
    designation = data.get('designation')

    if not all([name, email, password, phone, role]):
        return jsonify({'success': False, 'error': {'message': 'Missing required fields'}}), 400

    if role not in ['PUBLIC', 'DEPARTMENT', 'ADMIN']:
        return jsonify({'success': False, 'error': {'message': 'Invalid role specified'}}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': {'message': 'Email already exists'}}), 400

    # Role Logic with Access Codes
    if role in ['DEPARTMENT', 'ADMIN']:
        if not access_code_str:
            return jsonify({'success': False, 'error': {'message': 'Invalid or expired authorization code.'}}), 400
            
        code_record = AccessCode.query.filter_by(code=access_code_str).first()
        if not code_record:
            return jsonify({'success': False, 'error': {'message': 'Invalid or expired authorization code.'}}), 400
            
        if code_record.status != 'ACTIVE' or code_record.expires_at < datetime.utcnow() or code_record.role_type != role:
            return jsonify({'success': False, 'error': {'message': 'Invalid or expired authorization code.'}}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    new_user = User(
        name=name, 
        email=email, 
        phone=phone,
        department=department if role == 'DEPARTMENT' else None,
        designation=designation if role == 'DEPARTMENT' else None,
        password_hash=hashed_pw, 
        role=role,
        account_status='ACTIVE'
    )
    db.session.add(new_user)
    db.session.flush() # Get new_user.id

    if role in ['DEPARTMENT', 'ADMIN']:
        code_record = AccessCode.query.filter_by(code=access_code_str).first()
        code_record.status = 'USED'
        code_record.used_at = datetime.utcnow()
        code_record.used_by = new_user.id

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

    if user.account_status != 'ACTIVE':
        return jsonify({'success': False, 'error': {'message': 'Account is suspended or pending approval'}}), 403

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
