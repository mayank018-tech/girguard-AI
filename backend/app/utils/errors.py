from flask import jsonify
import traceback

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "error": {"code": "BAD_REQUEST", "message": str(e)}}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": {"code": "NOT_FOUND", "message": "The requested resource was not found."}}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "error": {"code": "METHOD_NOT_ALLOWED", "message": "Method not allowed."}}), 405

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"success": False, "error": {"code": "UNPROCESSABLE", "message": str(e)}}), 422

    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({"success": False, "error": {"code": "INTERNAL_ERROR", "message": str(e), "traceback": traceback.format_exc()}}), 500
