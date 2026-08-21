from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.access_code import AccessCode
from app.extensions import db
import jwt
import random
import string
from datetime import datetime, timedelta
from flask import current_app

bp = Blueprint('admin_auth', __name__, url_prefix='/api/v1/admin')

def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return User.query.get(payload['sub'])
    except:
        return None

def generate_random_code(role_type):
    prefix = "GIR-DEPT-" if role_type == 'DEPARTMENT' else "GIR-ADMIN-"
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return prefix + suffix

@bp.route('/access-codes', methods=['GET'])
def get_access_codes():
    user = get_current_user()
    if not user or user.role != 'ADMIN':
        return jsonify({'success': False, 'error': {'message': 'Unauthorized'}}), 403

    codes = AccessCode.query.order_by(AccessCode.created_at.desc()).all()
    
    # Auto-expire older ACTIVE codes past their date
    for c in codes:
        if c.status == 'ACTIVE' and c.expires_at < datetime.utcnow():
            c.status = 'EXPIRED'
    db.session.commit()
            
    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in codes]
    }), 200

@bp.route('/access-codes', methods=['POST'])
def generate_access_code():
    user = get_current_user()
    if not user or user.role != 'ADMIN':
        return jsonify({'success': False, 'error': {'message': 'Unauthorized'}}), 403

    data = request.json
    role_type = data.get('role_type')
    expiry_days = int(data.get('expiry_days', 7))

    if role_type not in ['DEPARTMENT', 'ADMIN']:
        return jsonify({'success': False, 'error': {'message': 'Invalid role_type'}}), 400

    new_code = AccessCode(
        code=generate_random_code(role_type),
        role_type=role_type,
        status='ACTIVE',
        created_by=user.id,
        expires_at=datetime.utcnow() + timedelta(days=expiry_days)
    )
    db.session.add(new_code)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': new_code.to_dict()
    }), 201

@bp.route('/access-codes/<code_id>/revoke', methods=['POST'])
def revoke_access_code(code_id):
    user = get_current_user()
    if not user or user.role != 'ADMIN':
        return jsonify({'success': False, 'error': {'message': 'Unauthorized'}}), 403

    code_record = AccessCode.query.get(code_id)
    if not code_record:
        return jsonify({'success': False, 'error': {'message': 'Code not found'}}), 404

    if code_record.status == 'ACTIVE':
        code_record.status = 'REVOKED'
        db.session.commit()

    return jsonify({
        'success': True,
        'data': code_record.to_dict()
    }), 200
