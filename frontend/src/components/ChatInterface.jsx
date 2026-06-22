import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, ArrowLeft, Loader2, Link as LinkIcon } from 'lucide-react';

export default function ChatInterface({ url, onReset }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hello! I have finished reading ${url}. What would you like to know about it?`,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userQuestion = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuestion }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
        question: userQuestion,
        url: url
      });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: response.data.answer,
        sources: response.data.sources || []
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Sorry, I ran into an error trying to answer that. Is the backend running?",
        sources: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Website AI Assistant</h1>
            <p className="text-sm text-gray-500 truncate max-w-md">Chatting with: {url}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Start Over
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        >
                          <LinkIcon className="w-3 h-3" /> Source {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}

            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this website..."
              disabled={isTyping}
              className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}