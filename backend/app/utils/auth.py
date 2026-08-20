import os
import jwt
from functools import wraps
from flask import request, jsonify, current_app
from app.models.user import User

def get_jwt_secret():
    return os.environ.get('JWT_SECRET_KEY', 'fallback_secret_for_development_only')

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': {'message': 'Missing or invalid authorization header'}}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
            user = User.query.get(payload['sub'])
            if not user:
                raise Exception("User not found")
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': {'message': 'Token has expired'}}), 401
        except Exception as e:
            return jsonify({'success': False, 'error': {'message': 'Invalid token'}}), 401
            
        return f(*args, **kwargs)
    return decorated

def require_role(role_name):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user') or request.user.role != role_name:
                return jsonify({'success': False, 'error': {'message': f'Requires {role_name} role'}}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
