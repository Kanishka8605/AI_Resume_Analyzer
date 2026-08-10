import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';

const AIChatBot = ({ resumeText, targetRole }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **AI Career Assistant**. I have analyzed your resume for the **${targetRole || 'target'}** role.\n\nAsk me anything! I can rewrite bullet points, identify missing skills, generate interview questions, or draft cover letter intros tailored specifically to your resume.`,
      followups: [
        `How can I tailor my resume for ${targetRole || 'this position'}?`,
        `Rewrite my top project bullet points with metrics`,
        `Generate 5 interview questions for ${targetRole || 'this role'}`,
        `Draft a cover letter intro`
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userTurn = { role: 'user', content: query };
    const updatedMessages = [...messages, userTurn];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Pass previous history (filtering initial greeting)
      const historyTurns = updatedMessages
        .filter((_, idx) => idx > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await apiService.chatWithBot(
        resumeText || '',
        targetRole || '',
        historyTurns,
        query
      );

      if (res.success && res.data) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply || "I've reviewed your request based on your resume.",
            followups: res.data.suggestedFollowups || []
          }
        ]);
      } else {
        throw new Error(res.error || 'Failed to receive AI response.');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered a temporary issue connecting to the AI engine. However, you can re-submit your prompt or ask how to rewrite your bullets for this position!',
          followups: ['Try rewriting my bullet points again', 'What skills should I add?']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const defaultPrompts = [
    `🎯 Tailor for ${targetRole || 'Target Role'}`,
    `✍️ Quantify Bullet Points`,
    `🎙️ 5 Interview Questions`,
    `✉️ Draft Cover Letter Intro`
  ];

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col h-[650px] shadow-2xl">
      {/* Bot Top Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AI Career Assistant Bot</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Tailoring feedback for:</span>
              <span className="text-indigo-400 font-semibold">{targetRole || 'General Professional'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors cursor-pointer"
          title="Reset conversation"
        >
          <RefreshCw size={13} />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-slate-950/40">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={16} />
              </div>
            )}

            <div className="space-y-2 max-w-[85%]">
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed text-slate-200 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-850/90 border border-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>

                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-end border-t border-slate-800/60 pt-2.5 mt-3 text-xs text-slate-400">
                    <button
                      onClick={() => copyToClipboard(msg.content, idx)}
                      className="flex items-center gap-1 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Follow-up Chip Suggestions */}
              {msg.role === 'assistant' && msg.followups && msg.followups.length > 0 && idx === messages.length - 1 && (
                <div className="flex flex-wrap gap-2 pt-1 pl-1">
                  {msg.followups.map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleSendMessage(chip)}
                      disabled={isLoading}
                      className="text-xs bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 text-indigo-300 px-3 py-1.5 rounded-lg font-medium transition-all hover:border-indigo-500/60 text-left cursor-pointer disabled:opacity-50"
                    >
                      💡 {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="animate-spin" />
            </div>
            <div className="bg-slate-850/90 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs font-medium ml-1">AI Coach is analyzing your resume...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar & Preset Action Chips */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800/90 space-y-3">
        {/* Preset Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {defaultPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText.replace(/^[^\s]+\s*/, ''))}
              disabled={isLoading}
              className="px-3 py-1 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-full text-xs text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <div className="relative flex items-center">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask AI Coach to rewrite bullet points, suggest keywords, or prepare interview questions for ${targetRole || 'your target position'}...`}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder-slate-500 resize-none outline-none transition-all custom-scrollbar"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Send Message (Enter)"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Press Enter to send message</span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> Live AI Context Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;
