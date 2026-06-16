import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Copy, Sparkles, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGenerateStream } from "@/lib/use-stream";
import { ModuleHeader } from "@/components/module-header";

export const Route = createFileRoute("/_app/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — NexusAI" }] }),
  component: EmailPage,
});

const TONES = ["Formal & Executive", "Friendly & Warm", "Persuasive & Urgent"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese"];

function EmailPage() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const { text, setText, isStreaming, error, run, stop } = useGenerateStream();

  const onGenerate = () => {
    if (!prompt.trim()) return toast.error("Add a topic or context first.");
    run("email", prompt, { tone, language });
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Email copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ModuleHeader icon={Mail} title="Smart Email Generator" desc="Draft executive-grade emails in seconds." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <h2 className="text-sm font-semibold tracking-tight">Compose</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="prompt">Topic / context</Label>
              <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={8} placeholder="e.g. Follow up with vendor on Q3 contract renewal, ask for revised pricing, propose a meeting next week." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onGenerate} disabled={isStreaming} className="bg-indigo-600 hover:bg-indigo-700">
                {isStreaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isStreaming ? "Generating…" : "Generate email"}
              </Button>
              {isStreaming && (
                <Button variant="outline" onClick={stop}><Square className="mr-2 h-4 w-4" /> Stop</Button>
              )}
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        </Card>

        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Draft</h2>
            <Button size="sm" variant="outline" onClick={onCopy} disabled={!text}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={20}
            placeholder="Your generated email will appear here — fully editable."
            className="mt-4 font-mono text-sm leading-relaxed"
          />
          {isStreaming && <p className="mt-2 text-xs text-slate-500"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500" /> Streaming…</p>}
        </Card>
      </div>
    </div>
  );
}
