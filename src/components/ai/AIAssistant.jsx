"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import {
  detectContext,
  getQuickReplies,
  getAIResponseAsync,
  simulateTyping,
} from "@/lib/ai-utils";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const context = detectContext(pathname);
  const quickReplies = getQuickReplies(context);

  // İlk mesajı yükle
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage =
        "Merhaba! Ben Civardaki AI, işletmenizin akıllı asistanıyım. Size nasıl yardımcı olabilirim? İşletmenizle ilgili her konuda sorularınızı sorabilirsiniz - satışlar, müşteriler, stok, finans veya başka bir konuda yardımcı olabilirim.";
      setMessages([
        {
          id: 1,
          role: "assistant",
          text: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Mesajlar değiştiğinde scroll yap
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Modal açıldığında input'a focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const appendAssistantReply = (replyText) => {
    const aiId = Date.now() + 1;
    const newAIMessage = {
      id: aiId,
      role: "assistant",
      text: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newAIMessage]);

    if (!replyText || replyText.length > 1200) {
      setMessages((prev) => {
        const u = [...prev];
        u[u.length - 1] = { ...u[u.length - 1], text: replyText || "" };
        return u;
      });
      setIsTyping(false);
      return;
    }

    simulateTyping(
      replyText,
      (text) => {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length === 0) return updated;
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text,
          };
          return updated;
        });
      },
      15
    );

    setTimeout(() => {
      setIsTyping(false);
    }, replyText.length * 15 + 100);
  };

  const sendWithText = async (rawText) => {
    const trimmed = (rawText || "").trim();
    if (!trimmed || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    const historyForApi = [...messages, userMessage]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-40)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    let replyText = "";

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi, pathname, context }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.reply) {
        replyText = data.reply;
      } else {
        if (res.status === 429) {
          toast.error("Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.");
        } else {
          toast.error("AI şu an kullanılamıyor. Örnek yanıt gösteriliyor.");
        }
        replyText = await getAIResponseAsync(context, trimmed, 0);
      }
    } catch {
      toast.error("Bağlantı hatası. Örnek yanıt gösteriliyor.");
      replyText = await getAIResponseAsync(context, trimmed, 0);
    }

    appendAssistantReply(replyText);
  };

  const handleSendMessage = async () => {
    await sendWithText(inputValue);
  };

  const handleQuickReply = (reply) => {
    void sendWithText(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#004aad] to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-[#004aad]/50 transition-all duration-300 group"
        aria-label="AI Asistanı Aç"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <SparklesIcon className="h-7 w-7" />
        </motion.div>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
          />
        )}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-96 md:h-[600px] md:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#004aad] to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Civardaki AI</h3>
                    <p className="text-xs text-blue-100">
                      İşletmenizin akıllı asistanı
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#004aad] to-blue-600 text-white"
                          : "bg-white text-gray-800 shadow-sm border border-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-[#004aad] rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-[#004aad] rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-[#004aad] rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies - Her zaman göster */}
              {quickReplies.length > 0 && (
                <div className="px-4 py-2 bg-white border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Hızlı sorular:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.slice(0, 4).map((reply, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-[#004aad] rounded-full transition-colors border border-blue-200"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Civardaki AI'a soru sorun..."
                      rows={1}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004aad] focus:border-transparent resize-none max-h-32"
                      style={{ minHeight: "40px" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 bg-gradient-to-r from-[#004aad] to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
