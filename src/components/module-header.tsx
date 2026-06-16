import type { LucideIcon } from "lucide-react";

export function ModuleHeader({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
