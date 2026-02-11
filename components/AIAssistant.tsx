
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from '../types';

interface AIAssistantProps {
  products: Product[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hello! I’m Triship’s shopping assistant. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Use Vite environment variable - works in both dev and production
      const apiKey = import.meta.env.VITE_API_KEY as string;
      if (!apiKey) {
        throw new Error("API Key not configured");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Limit product context to provide a concise catalog snapshot for the AI
      const contextItems = products.slice(0, 15).map(p => 
        `- ${p.name}: $${p.price} (${p.category}). ${p.description.substring(0, 80)}...`
      ).join('\n');
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
        systemInstruction: `You are "ProBot", the elegant AI shopping concierge for Triship.
          
          Store Context:
          Triship is a high-end dropshipping destination for clothes and accessories.
          
          Our Current Featured Catalog:
          ${contextItems}
          
          Guidelines:
          1. Be sophisticated, helpful, and professional in your tone.
          2. Always speak in the same language as the user (Indonesian or English).
          3. Recommend specific products from the list above when they match the user's request.
          4. If a requested item isn't available, suggest a similar luxury alternative from our collection.
          5. Keep responses elegant and concise.
          6. Focus on helping with product discovery, pricing, and general store inquiries.`
      });

      // Get text from response
      const botResponse = result.response.text();
      
      if (!botResponse) {
        throw new Error("Empty response");
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error: any) {
      console.error("Gemini Assistant Interaction Failed:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I’m experiencing a technical issue."}]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-[350px] sm:w-[400px] h-[550px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header Section */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="flex items-center space-x-3 relative z-10">
              <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm heading-font tracking-tight">ProBot Concierge</h3>
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-2 rounded-xl transition-colors relative z-10"
              aria-label="Close assistant"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-lg shadow-slate-900/10' 
                    : 'bg-white text-slate-700 shadow-sm border border-gray-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white p-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-gray-100 flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Interface */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="How can I assist your shopping today?"
                className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all pr-12"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`absolute right-2 p-2.5 rounded-xl transition-all ${
                  input.trim() && !isTyping 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center space-x-1 text-gray-400">
              <Sparkles size={10} className="text-amber-500" />
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold">Triship AI Agent</p>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl hover:bg-amber-600 transition-all hover:scale-105 flex items-center space-x-3 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-slate-900"></span>
            </div>
          </div>
          <span className="font-bold text-sm pr-2 hidden sm:inline relative z-10">Ask AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
