/**
 * GirGuard AI — IBM Granite AI Service Interface
 *
 * CURRENT STATE: Returns contextual mock responses.
 * FUTURE STATE:  Connect to Flask backend → IBM Granite LLM via IBM Cloud.
 *
 * SECURITY RULES:
 *  - NEVER call IBM Cloud / WatsonX directly from this file in production.
 *  - ALL IBM credentials must live exclusively in the Flask backend.
 *  - The browser must never see private IBM API keys.
 *
 * Integration path (next phase):
 *   sendMessageToGranite(msg, ctx)
 *     → POST /api/ai/chat  (Flask backend)
 *     → IBM WatsonX / Granite
 *     → streamed response back to frontend
 */

const MOCK_RESPONSES = {
  default: [
    "Based on current sensor data and historical patterns, Jamwala village shows the highest risk score (88/100) due to recent verified lion sighting + movement corridor overlap.",
    "I've analysed today's incident data. There are currently 2 CRITICAL, 2 HIGH, and 2 ACTIVE incidents requiring immediate attention.",
    "Villages with increasing risk trend over the past 48 hours: Jamwala (+12pts), Visavadar (+8pts), Sasan Gir (+5pts).",
    "Today's conflict summary: 8 total incidents logged. 2 CRITICAL remain active. Livestock losses: 1 buffalo (pending verification). Response teams deployed: 2.",
    "Generating conflict report for 15 January 2024... [DEMO] Report includes 8 incidents, 10 risk predictions, 2 livestock loss events. Full report generation requires IBM Granite integration.",
  ],
  keywords: {
    'high risk': "Villages currently rated HIGH or CRITICAL: Jamwala (88 — CRITICAL), Visavadar (82 — CRITICAL), Sasan Gir (72 — HIGH), Talala (63 — HIGH). Risk factors include recent sightings, corridor proximity, and historical incident data.",
    'incident': "Active incidents: INC-3001 (Jamwala, Lion, CRITICAL — ACTIVE), INC-3002 (Visavadar, Lion, CRITICAL — RESPONDING), INC-3003 (Sasan Gir, Lion, HIGH — MONITORING), INC-3004 (Maliya, Leopard, HIGH — MONITORING).",
    'jamwala': "Jamwala risk analysis: Score 88/100 (CRITICAL). Factors: Sub-adult male lion territorial marking confirmed 20:30 today. Movement corridor overlap. 15 historical incidents this season. Rapid Response Team Alpha deployed.",
    'team': "Response teams status: Alpha (DEPLOYED — Jamwala), Beta (STANDBY — Sasan HQ), Patrol Units 1-3 (PATROLLING/DEPLOYED), Beat Guards A/B/C (ON_DUTY), Night Patrol 1 (OFF_DUTY).",
    'livestock': "Livestock losses this month: 2 APPROVED claims (₹23,000 disbursed), 1 UNDER REVIEW, 1 VERIFICATION REQUIRED, 1 SUBMITTED, 1 REJECTED. Most vulnerable species: Cow (2 incidents), Goat (7 animals lost).",
    'tourist': "Current tourist safety: Sasan Gir Core Zone (OPEN, 72/100), Devaliya Safari (OPEN, 85/100), Girnar Trail (RESTRICTED — leopard activity). Avoid post-sunset in Kankai Mata area.",
    'lion': "Asiatic lion activity: 5 verified sightings in last 24h. Active incidents in Jamwala (CRITICAL), Visavadar (CRITICAL), Sasan Gir (HIGH). Movement corridor active. Peak activity window: 18:00–06:00.",
    'leopard': "Leopard activity: 3 verified sightings in last 48h. Incidents in Maliya (HIGH), Kodinar (RESOLVED), Mendarda (pending verification). Primarily nocturnal movement pattern detected.",
    'report': "Generating today's conflict report... [DEMO] Date: 15 Jan 2024 | Incidents: 8 | Critical: 2 | Livestock losses: 3 | Teams deployed: 2 | Avg response time: 28 min. Note: Full AI report generation requires IBM Granite integration.",
    'forecast': "6-hour risk forecast for Sasan Gir region: Now 72 → +1h 75 → +2h 81 → +3h 85 (peak) → +4h 79 → +5h 68 → +6h 55. Risk peaks align with nocturnal wildlife activity window.",
  }
};

function getMockResponse(message) {
  const lower = message.toLowerCase();
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES.keywords)) {
    if (lower.includes(keyword)) return response;
  }
  // Rotate default responses
  const idx = Math.floor(Math.random() * MOCK_RESPONSES.default.length);
  return MOCK_RESPONSES.default[idx];
}

const delay = (ms = 800) => new Promise(res => setTimeout(res, ms));

/**
 * Send a message to the AI assistant.
 *
 * @param {string} message  — User message text
 * @param {object} context  — Optional context: { villageId, incidentId, alertId }
 * @returns {Promise<{reply: string, source: string, timestamp: string}>}
 */
export async function sendMessageToGranite(message, context = {}) {
  await delay(600 + Math.random() * 400); // Simulate LLM latency
  const reply = getMockResponse(message);
  return {
    reply,
    source: 'mock',
    model: 'ibm-granite-mock',
    timestamp: new Date().toISOString(),
  };
}
