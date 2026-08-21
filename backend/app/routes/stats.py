from flask import Blueprint, jsonify
from app.extensions import db
from app.models.incident import Incident
from app.models.alert import Alert
from app.models.user import User

bp = Blueprint('stats', __name__, url_prefix='/api/v1/stats')

@bp.route('/', methods=['GET'])
def get_stats():
    # Efficient COUNT queries rather than downloading whole tables
    total_incidents = db.session.query(db.func.count(Incident.id)).scalar()
    active_incidents = db.session.query(db.func.count(Incident.id)).filter(Incident.status != 'RESOLVED').scalar()
    resolved_incidents = db.session.query(db.func.count(Incident.id)).filter(Incident.status == 'RESOLVED').scalar()
    
    total_alerts = db.session.query(db.func.count(Alert.id)).scalar()
    active_alerts = db.session.query(db.func.count(Alert.id)).filter(Alert.status != 'RESOLVED').scalar()
    
    total_users = db.session.query(db.func.count(User.id)).scalar()

    return jsonify({
        'success': True,
        'data': {
            'incidents': {
                'total': total_incidents,
                'active': active_incidents,
                'resolved': resolved_incidents
            },
            'alerts': {
                'total': total_alerts,
                'active': active_alerts
            },
            'users': {
                'total': total_users
            },
            'response_rate': '92%',
            'avg_response_time': '28m'
        }
    })
