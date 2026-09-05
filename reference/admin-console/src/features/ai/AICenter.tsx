"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Send } from "lucide-react";
import { SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { AI_FALLBACK_RESPONSE, AI_MOCK_RESPONSES, AI_SUGGESTIONS, aiInsights, aiMessages, type ChatMessage } from "./data";

const ACCENT = "#FF6B35";

export function AICenter() {
  const [messages, setMessages] = useState(aiMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const key = Object.keys(AI_MOCK_RESPONSES).find(k => input.toLowerCase().includes(k));
      const reply = key ? AI_MOCK_RESPONSES[key] : AI_FALLBACK_RESPONSE;
      setMessages(m => [...m, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Centro de IA" sub="Insights automáticos, predicciones y asistente inteligente" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-2">
        {aiInsights.map((ins, i) => (
          <Card key={i} className="p-4 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${ins.color.split(" ").slice(1).join(" ")}`}>
              <ins.icon size={15} className={ins.color.split(" ")[0]} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-gray-900 mb-0.5">{ins.title}</div>
              <div className="text-[12px] text-gray-500 leading-relaxed">{ins.text}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col" style={{ height: "460px" }}>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Brain size={15} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">Asistente Parchemos IA</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> En línea
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5" style={{ background: ACCENT }}>
                  <Brain size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === "user" ? "text-white rounded-br-md" : "bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100"
                }`}
                style={msg.role === "user" ? { background: ACCENT } : {}}
              >
                {msg.text.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-1" : ""}>
                    {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0" style={{ background: ACCENT }}>
                <Brain size={13} className="text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 pb-4 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {AI_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-[11px] px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#FFF1EB] hover:text-[#FF6B35] border border-gray-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Pregunta algo sobre la plataforma..."
              className="flex-1 px-4 py-2.5 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]/50"
            />
            <button
              onClick={send}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
              style={{ background: ACCENT }}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
