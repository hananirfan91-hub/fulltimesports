import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, 
  Sparkles, RefreshCw, ChevronDown, ExternalLink, HelpCircle, 
  CheckCircle2, Radio, User, ShieldCheck, Database
} from 'lucide-react';
import { answerQueryFromDatabase } from '../lib/knowledgeEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioUrl?: string;
}

interface ChatBotProps {
  onNavigate: (path: string) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! Welcome to **The Sports Room**. I'm your interactive Voice Assistant. Ask me anything about our website articles, blog posts, live streams, sports hubs, or author Hanan Irfan!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please type your query!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking && activeAudioId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setActiveAudioId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveAudioId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveAudioId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const replyText = await answerQueryFromDatabase(query);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (autoPlayAudio) {
        setTimeout(() => {
          handleSpeak(replyText, botMsg.id);
        }, 300);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "Apologies! An error occurred while searching TSR knowledge database. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInlineStyles = (text: string) => {
    // Tokenize links, bold, italic, and code snippets
    const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // 1. Link check [title](url)
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (linkMatch) {
        const linkTitle = linkMatch[1];
        const linkUrl = linkMatch[2];
        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              if (linkUrl.startsWith('http')) {
                window.open(linkUrl, '_blank');
              } else {
                onNavigate(linkUrl);
                setIsOpen(false);
              }
            }}
            className="text-[#22c55e] hover:text-emerald-300 bg-[#22c55e]/15 hover:bg-[#22c55e]/25 border border-[#22c55e]/40 font-mono font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 mx-0.5 transition cursor-pointer text-[11px] align-middle shadow-sm"
          >
            <span>{linkTitle}</span>
            <ExternalLink className="h-3 w-3 inline text-[#22c55e]" />
          </button>
        );
      }

      // 2. Bold check **text**
      const boldMatch = /^\*\*([^*]+)\*\*$/.exec(part);
      if (boldMatch) {
        return (
          <strong key={index} className="font-bold text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded text-[11.5px]">
            {boldMatch[1]}
          </strong>
        );
      }

      // 3. Italic check *text*
      const italicMatch = /^\*([^*]+)\*$/.exec(part);
      if (italicMatch) {
        return (
          <em key={index} className="italic text-slate-300">
            {italicMatch[1]}
          </em>
        );
      }

      // 4. Code check `text`
      const codeMatch = /^`([^`]+)`$/.exec(part);
      if (codeMatch) {
        return (
          <code key={index} className="font-mono text-[11px] bg-slate-900 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-900">
            {codeMatch[1]}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-2">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1" />;

          // Check if line is a blockquote (starts with '>')
          if (trimmed.startsWith('>')) {
            const quoteText = trimmed.replace(/^>\s*/, '');
            return (
              <blockquote key={lIdx} className="my-1.5 pl-3 border-l-2 border-[#22c55e] text-slate-200 bg-emerald-950/60 py-2 px-3 rounded-r-xl text-[11px] italic leading-relaxed shadow-inner">
                {renderInlineStyles(quoteText)}
              </blockquote>
            );
          }

          // Check if line is a bullet item (starts with '-', '*', or emoji bullets)
          if (trimmed.startsWith('-') || trimmed.startsWith('* ') || /^[\u1F300-\u1F9FF\u2600-\u26FF📌🏏⚽🏎️📺🗺️👤]\s/.test(trimmed)) {
            const bulletText = trimmed.replace(/^([-*📌🏏⚽🏎️📺🗺️👤]|\u1F44D)\s*/, '');
            return (
              <div key={lIdx} className="flex items-start space-x-2 my-1 bg-emerald-950/40 p-2 px-3 rounded-xl border border-emerald-900/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1.5 shrink-0 shadow-sm shadow-emerald-400" />
                <div className="text-xs text-slate-200 leading-normal flex-1">
                  {renderInlineStyles(bulletText)}
                </div>
              </div>
            );
          }

          // Check for section headings or emphasized section headers
          if (trimmed.startsWith('#') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 60)) {
            const headingText = trimmed.replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '');
            return (
              <h4 key={lIdx} className="text-xs font-mono font-black text-[#22c55e] uppercase tracking-wider mt-2 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-[#22c55e] rounded-full inline-block" />
                <span>{headingText}</span>
              </h4>
            );
          }

          // Standard paragraph line
          return (
            <p key={lIdx} className="text-xs leading-relaxed text-slate-200">
              {renderInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const quickPrompts = [
    "Who owns The Sports Room?",
    "Where can I watch live streams?",
    "What sports do you cover?",
    "How do I submit an editorial ticket?"
  ];

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-[#022c22] hover:bg-[#01140f] text-white p-3.5 rounded-2xl shadow-2xl border border-[#22c55e]/50 flex items-center space-x-2.5 group cursor-pointer backdrop-blur-md"
          id="tsr-ai-chatbot-toggle-btn"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#22c55e] text-[#022c22] font-black">
            <Bot className="h-5 w-5 text-[#022c22] group-hover:rotate-12 transition duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#022c22]" />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-xs font-mono font-black uppercase text-white tracking-wider flex items-center gap-1">
              <span>TSR Voice AI</span>
              <Sparkles className="h-3 w-3 text-[#22c55e]" />
            </span>
            <span className="text-[10px] font-mono text-emerald-300/80">Ask &amp; Listen Live</span>
          </div>
        </motion.button>
      </div>

      {/* CHATBOT DRAWER / POPUP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-3 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[580px] bg-[#022c22] border border-[#22c55e]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
            id="tsr-ai-chatbot-drawer"
          >
            {/* CHAT HEADER */}
            <div className="bg-[#01140f] px-4 py-3.5 border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center text-[#22c55e]">
                  <Bot className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">TSR Voice AI</h3>
                    <span className="px-1.5 py-0.5 bg-[#22c55e]/20 text-[#22c55e] text-[9px] font-mono font-bold rounded">ONLINE</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">The Sports Room Verified Guide</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                  title={autoPlayAudio ? "Auto-read speech ON" : "Auto-read speech OFF"}
                  className={`p-2 rounded-xl transition cursor-pointer font-mono text-xs ${
                    autoPlayAudio 
                      ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                  id="chatbot-toggle-audio-btn"
                >
                  {autoPlayAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/80 rounded-xl transition cursor-pointer"
                  id="chatbot-close-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* MESSAGES BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-emerald-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-[#22c55e] text-slate-950 font-bold rounded-br-none border border-emerald-400'
                        : 'bg-[#01140f] text-slate-200 border border-emerald-900/80 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {renderFormattedText(msg.text)}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] opacity-70 gap-3 border-t border-black/10 pt-1 font-mono">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className="flex items-center space-x-1 text-[#22c55e] hover:text-[#4ade80] transition cursor-pointer font-bold"
                          title="Listen to message voice"
                        >
                          <Volume2 className={`h-3 w-3 ${activeAudioId === msg.id ? 'animate-bounce text-emerald-400' : ''}`} />
                          <span>{activeAudioId === msg.id ? 'Playing...' : 'Speak'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 bg-[#01140f] border border-emerald-900/60 text-emerald-400 p-3 rounded-2xl w-fit">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#22c55e]" />
                  <span className="text-xs font-mono">TSR AI is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK PROMPT SUGGESTIONS */}
            {messages.length < 5 && (
              <div className="px-3 py-2 bg-[#01140f]/80 border-t border-emerald-900/40">
                <p className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-[#22c55e]" />
                  <span>Suggested queries:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(qp)}
                      className="text-[10px] font-mono bg-[#022c22] hover:bg-[#22c55e]/20 text-slate-300 hover:text-emerald-300 border border-emerald-900/60 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LIVE VOICE LISTENING INDICATOR BAR */}
            {isListening && (
              <div className="px-4 py-2 bg-rose-950/90 border-t border-rose-800 text-rose-200 text-xs font-mono flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <Radio className="h-4 w-4 text-rose-400 animate-ping" />
                  <span>Listening live... Speak your question clearly</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="text-xs text-rose-300 hover:underline font-bold cursor-pointer"
                >
                  Stop
                </button>
              </div>
            )}

            {/* INPUT FOOTER */}
            <div className="p-3 bg-[#01140f] border-t border-emerald-900/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Click to ask with your voice"}
                  className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-[#22c55e] border border-emerald-800'
                  }`}
                  id="chatbot-mic-btn"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening to your voice..." : "Ask a question about TSR..."}
                  style={{ color: '#ffffff', caretColor: '#22c55e', backgroundColor: '#011e17' }}
                  className="chatbot-input flex-1 bg-[#011e17] border border-emerald-500/80 !text-white font-medium text-xs sm:text-sm placeholder-slate-400 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#22c55e] focus:bg-[#022c22] focus:ring-1 focus:ring-[#22c55e] transition font-sans shadow-inner"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-[#22c55e] hover:bg-[#4ade80] disabled:bg-slate-800 disabled:text-slate-600 text-[#022c22] p-2.5 rounded-xl transition cursor-pointer font-bold flex items-center justify-center shrink-0"
                  id="chatbot-send-btn"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-[#22c55e]" />
                  <span>TSR Database &amp; Voice Engine</span>
                </span>
                <span>100% Verified Content</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
