import { useRef, useState } from 'react';
import { sendMessageToGranite } from '../services/api/index.js';
import { GraniteComingSoon, DemoDataBanner } from '../components/UI.jsx';

const EXAMPLE_PROMPTS = [
  { label: 'Risk Summary', text: 'Why is Jamwala high risk?' },
  { label: 'Active Incidents', text: 'Show active incidents.' },
  { label: 'Risk Trend', text: 'Which villages have increasing risk?' },
  { label: 'Daily Summary', text: 'Summarize today\'s incidents.' },
  { label: 'Conflict Report', text: 'Generate today\'s conflict report.' },
  { label: 'Risk Forecast', text: 'What is the 6-hour risk forecast?' },
  { label: 'Team Status', text: 'What is the response team status?' },
  { label: 'Lion Activity', text: 'Describe current lion activity.' },
  { label: 'Livestock Losses', text: 'Summarize recent livestock losses.' },
  { label: 'Tourist Safety', text: 'Is it safe for tourists today?' },
];

const INIT_MESSAGES = [
  {
    role: 'assistant',
    text: 'Hello. I am the GirGuard AI Copilot.\n\nI can assist with:\n??? Village risk analysis\n??? Incident summaries\n??? Wildlife activity patterns\n??? Response team status\n??? Conflict reports\n??? Tourist safety assessments\n\nNote: IBM Granite LLM integration is planned for Phase 2. I am currently operating with mock responses.',
    source: 'mock'
  }
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef               = useRef(null);

  async function sendMsg(text) {
    const msg = (text || input).trim();
    if (!msg || thinking) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setThinking(true);
    try {
      const res = await sendMessageToGranite(msg, {});
      setMessages(m => [...m, { role: 'assistant', text: res.reply, source: res.source }]);
    } finally {
      setThinking(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <DemoDataBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">IBM Granite AI Assistant</h1>
          <p className="text-sm text-gray-400 mt-1">Wildlife conflict analysis copilot for forest officials</p>
        </div>
        <GraniteComingSoon />
      </div>

      {/* IBM Granite info panel */}
      <div className="bg-indigo-950/40 border border-indigo-700/40 rounded-xl p-4 text-sm text-indigo-200 space-y-2">
        <div className="font-semibold text-indigo-300 flex items-center gap-2">???? About IBM Granite Integration</div>
        <ul className="list-disc list-inside text-xs text-indigo-300/80 space-y-1">
          <li>Current: Mock AI responses based on synthetic data.</li>
          <li>Phase 2: IBM Granite LLM via IBM WatsonX + IBM Cloud backend.</li>
          <li>The browser will NEVER directly hold IBM Cloud API credentials.</li>
          <li>All Granite calls will be proxied through the secure Flask backend.</li>
        </ul>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-green-800/60 text-green-100 rounded-br-sm' : 'bg-gray-700 text-gray-200 rounded-bl-sm'
              }`}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 mb-2 font-medium">
                    ???? GirGuard AI Copilot {m.source === 'mock' && <span className="text-gray-500">(mock)</span>}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-xs">Copilot thinking???</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Prompt chips */}
        <div className="px-4 py-2 border-t border-gray-700/50 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map(p => (
            <button
              key={p.label}
              onClick={() => sendMsg(p.text)}
              disabled={thinking}
              className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 rounded-full px-3 py-1 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about incidents, risk predictions, wildlife activity, village status??? (Enter to send)"
              disabled={thinking}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-600 resize-none"
            />
            <button
              onClick={() => sendMsg()}
              disabled={thinking || !input.trim()}
              className="bg-indigo-700 hover:bg-indigo-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-5 rounded-xl transition-colors text-sm self-stretch"
            >
              {thinking ? '???' : 'Send'}
            </button>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Shift+Enter for new line ?? Enter to send ?? IBM Granite integration: Phase 2
          </div>
        </div>
      </div>
    </div>
  );
}
