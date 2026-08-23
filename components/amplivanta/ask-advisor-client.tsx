"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

export function AskAdvisorClient({ suggested }: { suggested: string[] }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [live, setLive] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const j = await res.json();
      setConversationId(j.conversationId);
      setLive(j.live);
      setMessages((m) => [...m, { role: "assistant", content: j.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-grad-brand-2 text-white shadow-violet">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="max-w-lg rounded-2xl rounded-tl-sm bg-bg-soft p-4">
              <p className="text-[13px] leading-relaxed text-ink">
                Hi Alex 👋 — ask me anything about your funnel, campaigns, or revenue, or pick a
                suggested question to get started.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-ink/10 text-ink" : "bg-grad-brand-2 text-white shadow-violet"}`}>
              {m.role === "user" ? "You" : <Sparkles className="h-4 w-4" />}
            </span>
            <div className={`max-w-lg whitespace-pre-wrap rounded-2xl p-4 text-[13px] leading-relaxed ${m.role === "user" ? "rounded-tr-sm bg-violet text-white" : "rounded-tl-sm bg-bg-soft text-ink"}`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-grad-brand-2 text-white shadow-violet">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="rounded-2xl rounded-tl-sm bg-bg-soft p-4">
              <Loader2 className="h-4 w-4 animate-spin text-violet" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="mt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Suggested questions</div>
          <div className="flex flex-wrap gap-2">
            {suggested.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink-soft transition hover:border-violet/30 hover:text-violet"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-white p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or request an analysis…"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] focus:outline-none"
        />
        <button type="submit" disabled={loading} className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-cta text-white shadow-violet disabled:opacity-60">
          <Send className="h-4 w-4" />
        </button>
      </form>
      <div className="mt-2 text-center text-[10.5px] text-ink-muted">
        {live === false ? "Running in demo mode — set ANTHROPIC_API_KEY for live AI." : "AI Advisor uses your workspace data. Accuracy may vary."}
      </div>
    </div>
  );
}
