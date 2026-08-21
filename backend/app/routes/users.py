from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from app.utils.auth import require_auth
from app.utils.responses import success, validation_error, not_found

bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@bp.route('', methods=['GET'])
@require_auth
def get_users():
    # Only allow ADMIN
    if request.user.role != 'ADMIN':
        return jsonify({'success': False, 'error': {'message': 'Unauthorized'}}), 403
    
    users = User.query.order_by(User.created_at.desc()).all()
    return success(data=[u.to_dict() for u in users])

@bp.route('/<user_id>/role', methods=['PATCH'])
@require_auth
def update_user_role(user_id):
    if request.user.role != 'ADMIN':
        return jsonify({'success': False, 'error': {'message': 'Unauthorized'}}), 403
        
    data = request.get_json(silent=True) or {}
    new_role = data.get('role')
    
    if new_role not in ['PUBLIC', 'DEPARTMENT', 'ADMIN']:
        return validation_error('Invalid role')
        
    user = db.session.get(User, user_id)
    if not user:
        return not_found('User')
        
    user.role = new_role
    db.session.commit()
    
    return success(data=user.to_dict())
