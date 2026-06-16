import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, FlaskConical, MessageSquare, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "NexusAI — Workplace Productivity Assistant" },
      { name: "description", content: "Automate operational work and protect mental clarity with NexusAI." },
    ],
  }),
  component: Dashboard,
});

const modules = [
  { to: "/email", title: "Smart Email Generator", desc: "Draft executive-grade emails in any tone or language.", icon: Mail, accent: "from-indigo-500 to-indigo-700" },
  { to: "/notes", title: "Meeting Notes Summarizer", desc: "Turn chaotic transcripts into summary, actions, and decisions.", icon: FileText, accent: "from-violet-500 to-indigo-600" },
  { to: "/planner", title: "Task Planner & Wellbeing", desc: "Energy-aware schedules with ergonomic intermissions.", icon: CalendarClock, accent: "from-emerald-500 to-teal-600" },
  { to: "/research", title: "Research Assistant", desc: "Structured dossiers with insights, metrics, and references.", icon: FlaskConical, accent: "from-sky-500 to-indigo-600" },
  { to: "/chat", title: "AI Chat Assistant", desc: "Conversational sandbox with quick-prompt shortcuts.", icon: MessageSquare, accent: "from-rose-500 to-indigo-600" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Sparkles className="h-3 w-3" /> Welcome back
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          Your AI workplace, calibrated for clarity.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Five focused modules to automate operational work while actively protecting your attention, energy, and wellbeing.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="group">
            <Card className="relative h-full overflow-hidden border-slate-200/80 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-slate-800">
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${m.accent} text-white shadow-sm`}>
                <m.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">{m.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{m.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:gap-2 dark:text-indigo-400">
                Open module <ArrowRight className="h-3 w-3 transition-all" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat icon={Zap} label="Avg. drafting time" value="−74%" hint="vs. manual writing" />
        <Stat icon={Shield} label="Wellbeing blocks" value="12/day" hint="when ergonomic mode is on" />
        <Stat icon={Sparkles} label="Models powering NexusAI" value="Gemini 3" hint="via Lovable AI Gateway" />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Zap; label: string; value: string; hint: string }) {
  return (
    <Card className="border-slate-200/80 p-5 dark:border-slate-800">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</div>
    </Card>
  );
}
