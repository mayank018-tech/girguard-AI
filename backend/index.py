import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    app = create_app()
except Exception as e:
    import traceback
    traceback.print_exc()
    
    # Create a dummy app to prevent Gunicorn from crashing so we can see the error in the browser
    from flask import Flask, jsonify
    app = Flask(__name__)
    error_message = str(e)
    tb = traceback.format_exc()
    
    @app.route('/')
    @app.route('/<path:path>')
    def catch_all(path=""):
        return jsonify({
            "error": "Failed to boot app",
            "message": error_message,
            "traceback": tb.split('\n')
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
