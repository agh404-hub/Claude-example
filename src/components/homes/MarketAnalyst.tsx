import React, { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { MY_HOME, MARKET_STATS, COMP_STATS, RECENT_SALES, ACTIVE_LISTINGS, PRICE_TREND } from '../../data/homesData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const SYSTEM_PROMPT = `You are a friendly and knowledgeable real estate market analyst specializing in Trilogy at the Vineyards,
an active adult (55+) community in Brentwood, CA 94513. You have access to current market data for this community.

Current Market Data:
- Active listings: ${MARKET_STATS.totalActiveListing}
- Avg list price (all homes): ${fmt(MARKET_STATS.avgListPrice)}
- Avg sale price (all homes): ${fmt(MARKET_STATS.avgSalePrice)}
- Avg price per sqft: $${MARKET_STATS.avgPricePerSqft}
- Avg days on market: ${MARKET_STATS.avgDaysOnMarket} days
- List-to-sale ratio: ${(MARKET_STATS.listToSaleRatio * 100).toFixed(1)}%
- Months of inventory: ${MARKET_STATS.monthsOfInventory}

User's Home:
- 2 bed / 2 bath / 1,842 sqft
- Estimated value: ${fmt(MY_HOME.estimatedValue)} (range: ${fmt(MY_HOME.estimatedValueLow)} - ${fmt(MY_HOME.estimatedValueHigh)})

2bd/2ba Comparable Stats:
- Avg sale price: ${fmt(COMP_STATS.avgSalePrice)}
- Avg price per sqft: $${COMP_STATS.avgPricePerSqft}
- Avg days on market: ${COMP_STATS.avgDaysOnMarket} days
- Based on ${COMP_STATS.count} comparable sales

Recent Sales (last 6 months):
${RECENT_SALES.map(s => `- ${s.address}: ${s.beds}bd/${s.baths}ba ${s.sqft.toLocaleString()}sqft — sold ${fmt(s.salePrice!)} in ${s.daysOnMarket} days`).join('\n')}

Active Listings:
${ACTIVE_LISTINGS.map(l => `- ${l.address}: ${l.beds}bd/${l.baths}ba ${l.sqft.toLocaleString()}sqft — listed at ${fmt(l.listPrice!)} (${l.daysOnMarket} days on market)`).join('\n')}

12-Month Price Trend:
${PRICE_TREND.map(p => `- ${p.month}: avg $${(p.avgPrice / 1000).toFixed(0)}K, $${p.avgPricePerSqft}/sqft, ${p.salesVolume} sales`).join('\n')}

Be concise, helpful, and specific. Use exact numbers from the data when answering.
When the user asks about their home's value or what similar homes are selling for, reference the comparable data.
Keep responses to 2-4 short paragraphs maximum.`;

const SUGGESTED_QUESTIONS = [
  "What's my home worth right now?",
  "Is it a good time to sell?",
  "How long would it take to sell my home?",
  "What are similar homes selling for?",
  "How has the market trended over the past year?",
];

const MarketAnalyst: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey] = useState(() => import.meta.env.VITE_ANTHROPIC_API_KEY || '');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    if (!apiKey || apiKey === 'sk-ant-your-key-here') {
      setError('API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file.');
      return;
    }

    setError(null);
    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      let assistantText = '';
      setMessages([...updatedMessages, { role: 'assistant', content: '...' }]);

      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          assistantText += event.delta.text;
          setMessages([...updatedMessages, { role: 'assistant', content: assistantText }]);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error: ${msg}`);
      setMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const hasApiKey = apiKey && apiKey !== 'sk-ant-your-key-here';

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-2xl"
        title="AI Market Analyst"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="text-white font-bold text-sm">AI Market Analyst</div>
              <div className="text-emerald-100 text-xs">Trilogy at the Vineyards · 94513</div>
            </div>
            {!hasApiKey && (
              <span className="ml-auto text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                No API Key
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center">
                  Ask me anything about the Trilogy market or your home's value.
                </p>
                <div className="space-y-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 px-3 py-2 rounded-xl transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content === '...' ? (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce [animation-delay:0ms]">·</span>
                      <span className="animate-bounce [animation-delay:150ms]">·</span>
                      <span className="animate-bounce [animation-delay:300ms]">·</span>
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl">
                {error}
                {!hasApiKey && (
                  <div className="mt-1 text-red-500">
                    Add your key to <code className="bg-red-100 px-1 rounded">.env</code> as <code className="bg-red-100 px-1 rounded">VITE_ANTHROPIC_API_KEY</code>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasApiKey ? 'Ask about the market…' : 'Add API key to .env to enable'}
              disabled={loading || !hasApiKey}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !hasApiKey}
              className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              {loading ? '…' : '→'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default MarketAnalyst;
