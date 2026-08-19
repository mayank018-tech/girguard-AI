"""
GirGuard AI — IBM Granite Service Placeholder

CURRENT STATE: Returns structured mock responses.
FUTURE STATE:  Connect to IBM WatsonX / Granite via IBM Cloud.

Architecture (next phase):
    Flask → Agent Layer → IBM Granite → IBM Cloud

SECURITY: IBM credentials must NEVER be placed in the frontend.
          All IBM API keys live exclusively in this backend service.
"""


def explain_risk(village_name: str, risk_data: dict) -> dict:
    """
    [PLACEHOLDER] Generate a natural-language risk explanation for a village.

    Future: POST to IBM Granite with structured risk context.
    """
    level = risk_data.get("risk_level", "UNKNOWN")
    score = risk_data.get("risk_score", 0)
    return {
        "explanation": (
            f"[DEMO] Village {village_name} has a {level} risk score of {score}/100. "
            "IBM Granite explanation will be generated in next phase."
        ),
        "source": "mock",
        "model": "demo-placeholder",
    }


def generate_alert(village_name: str, species: str, risk_data: dict) -> dict:
    """
    [PLACEHOLDER] Generate a formatted alert message for a village.

    Future: Use IBM Granite to generate multilingual, context-aware alerts.
    """
    level = risk_data.get("risk_level", "UNKNOWN")
    return {
        "message": (
            f"[DEMO ALERT] {level} wildlife conflict risk detected near {village_name}. "
            f"{species} activity confirmed. Take precautions."
        ),
        "language": "en",
        "source": "mock",
        "model": "demo-placeholder",
    }


def summarize_incident(incident_data: dict) -> dict:
    """
    [PLACEHOLDER] Generate a summary of an incident for operations reports.

    Future: Use IBM Granite to produce structured incident summaries.
    """
    village = incident_data.get("village", "Unknown")
    species = incident_data.get("species", "Unknown")
    severity = incident_data.get("severity", "Unknown")
    return {
        "summary": (
            f"[DEMO] {severity} incident involving {species} near {village}. "
            "Full AI-generated summary available after IBM Granite integration."
        ),
        "source": "mock",
        "model": "demo-placeholder",
    }


def answer_query(query: str, context: dict = None) -> dict:
    """
    [PLACEHOLDER] Answer a natural-language query about wildlife conflict data.

    Future: Route through agent orchestrator → IBM Granite.
    """
    return {
        "reply": (
            f"[DEMO] Query received: '{query}'. "
            "IBM Granite-powered answers will be available in Task 3 — AI integration phase."
        ),
        "source": "mock",
        "model": "demo-placeholder",
        "context_used": bool(context),
    }
