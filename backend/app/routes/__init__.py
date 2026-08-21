# Routes package

from . import auth

def register_blueprints(app):
    app.register_blueprint(auth.bp, url_prefix='/api/v1/auth')
    from . import api
    app.register_blueprint(api.bp, url_prefix='/api/v1')


from .stats import bp as stats_bp
