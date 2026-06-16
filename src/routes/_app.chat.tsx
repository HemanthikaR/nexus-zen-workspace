import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Send, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ModuleHeader } from "@/components/module-header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "AI Chat — NexusAI" }] }),
  component: ChatPage,
});

const QUICK_PROMPTS = [
  "Optimize this for an executive briefing",
  "Draft a standard action tracking framework",
  "Suggest a wellbeing reset for a long day",
  "Turn this into 5 crisp bullet points",
];

function ChatPage() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages } = useChat({
    id: sessionId,
    transport,
  });
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = (text: string) => {
    const v = text.trim();
    if (!v || isBusy) return;
    sendMessage({ text: v });
    setInput("");
  };

  const clear = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <ModuleHeader icon={MessageSquare} title="AI Chat Assistant" desc="Conversational sandbox with quick prompts." />
        <Button variant="outline" size="sm" onClick={clear}><Trash2 className="mr-2 h-3.5 w-3.5" /> Clear conversation</Button>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200/80 dark:border-slate-800">
        <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">Welcome to NexusAI Chat</h3>
              <p className="mt-1 text-sm text-slate-500">Ask me to draft, summarize, restructure, or reset. Try a quick prompt below.</p>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                {isUser ? (
                  <div className="max-w-[85%] rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                    {text}
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-[85%] text-slate-800 dark:text-slate-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
          {isBusy && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => submit(q)}
                disabled={isBusy}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
              }}
              placeholder="Ask anything…"
              rows={2}
              className="flex-1 resize-none"
            />
            <Button type="submit" disabled={isBusy || !input.trim()} className="h-10 bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
