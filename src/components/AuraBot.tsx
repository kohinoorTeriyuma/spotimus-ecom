import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
}

const PRE_SEEDED_QUESTIONS = [
  { text: "What curated products are in stock right now?", label: "📦 In stock items" },
  { text: "What is your return policy and the return window?", label: "🔄 Returns policy" },
  { text: "How long is shipping and how much does it cost?", label: "🚚 Shipping speed" },
  { text: "How does your secure mock checkout system work?", label: "🛒 Checkout guide" },
];

export default function AuraBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Seed initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "model",
          content: "Hello, I am **Aura**, your curated lifestyle RAG assistant. I am connected directly to our real-time database to search our active inventory! How can I help you find minimal home essentials or clarify our shipping and return policies today?",
        },
      ]);
    }
  }, [messages]);

  // Handle active scroll to bottom
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive response from Assistant server.");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.reply || "I apologize, I received an empty response. Please try asking again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `⚠️ Sorry, I hit an obstruction: *${err.message || "Unknown error"}*. Please make sure your server is running and a valid API key is set in the secrets panel.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "model",
        content: "Hello again! Aura reset complete. Ask me any question about our curation list, orders, accounts, or return procedures.",
      },
    ]);
  };

  const formatText = (text: string) => {
    // Escape standard HTML chars to avoid XSS but let custom tags in
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Re-add custom styling
    // **bold** -> strong
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-ink">$1</strong>');
    
    // *italic* -> em
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Bullet list conversions
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc pl-1 text-stone-700 py-0.5">$1</li>');

    // Double linebreaks to paragraph spaces
    html = html.replace(/\n\n/g, '<div class="h-3"></div>');
    
    // Single linebreaks to simple br
    html = html.replace(/\n/g, "<br />");

    return <div className="text-sm font-sans leading-relaxed text-ink/90 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <>
      {/* Floating Chat Trigger Balloon */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
        id="aura-chat-trigger-group"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative p-4 rounded-full bg-olive text-white shadow-lg cursor-pointer transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
            isOpen ? "bg-stone-600 rotate-90" : "hover:bg-olive-hover group hover:scale-105"
          }`}
          title="Ask Aura Assistant"
          id="aura-chat-toggle-button"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          
          {/* Unread dot or subtle ping indicator */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 transform translate-x-1 -translate-y-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-olive"></span>
            </span>
          )}
        </button>

        {/* Hover brand tip */}
        <AnimatePresence>
          {!isOpen && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-16 bottom-2 py-1.5 px-3 bg-ink text-sand text-[11px] font-semibold tracking-wider uppercase rounded-lg shadow-md whitespace-nowrap mr-2 pointer-events-none"
            >
              Ask Aura Assistant
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Drawer Shell */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] bg-white rounded-[24px] border border-sand/45 shadow-2xl flex flex-col z-50 overflow-hidden"
            id="aura-chatbot-window"
          >
            {/* Header branding lockup */}
            <div className="bg-sand/30 border-b border-sand/40 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">AURA Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-[10px] text-stone-500 font-sans uppercase tracking-wider font-semibold">
                      Inventory RAG Grounded
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetChat}
                  className="p-1 px-1.5 hover:bg-sand/40 rounded-full text-stone-500 hover:text-ink transition-colors cursor-pointer"
                  title="Reset Conversation"
                  id="bot-reset-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-sand/40 rounded-full text-stone-500 hover:text-ink transition-colors cursor-pointer"
                  id="bot-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Log / Body area */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-bg-natural/20 scrollbar-thin">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[20px] p-4 shadow-2xs ${
                      m.role === "user"
                        ? "bg-olive text-white rounded-br-none"
                        : "bg-white border border-sand/40 text-ink rounded-bl-none"
                    }`}
                  >
                    {formatText(m.content)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-sand/40 text-stone-600 rounded-[20px] rounded-bl-none p-4 max-w-[85%] flex items-center gap-2.5 shadow-2xs">
                    <Loader2 className="w-4 h-4 text-olive animate-spin" />
                    <span className="text-xs font-sans text-stone-500">
                      Aura is matching inventory details...
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={listEndRef} />
            </div>

            {/* Preset "Training Questions" Quick Grid */}
            {messages.length <= 2 && (
              <div className="px-5 py-3 border-t border-sand/30 bg-white">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-2">
                  Frequent Queries:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PRE_SEEDED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.text)}
                      className="text-left py-1.5 px-2.5 bg-sand/20 hover:bg-sand/35 text-ink text-[11px] font-sans font-semibold rounded-lg border border-sand/30 transition-all cursor-pointer truncate"
                      title={q.text}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message input dispatch container */}
            <form
              onSubmit={handleFormSubmit}
              className="p-4 border-t border-sand/40 bg-white flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Aura anything about the store..."
                disabled={isLoading}
                className="flex-grow px-4 py-2 bg-sand/10 border border-sand/30 rounded-full text-sm text-ink placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-olive focus:border-olive disabled:opacity-50"
                id="bot-text-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-olive text-white rounded-full hover:bg-olive-hover disabled:bg-stone-300 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center cursor-pointer flex-shrink-0"
                id="bot-submit-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
