'use client';

import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'teal' | 'green' | 'amber' | 'slate';
}

const accents = {
  teal: 'bg-brand/10 text-brand border-brand/20',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

export default function StatCard({ title, value, icon: Icon, accent = 'teal' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={clsx('rounded-lg border p-2.5', accents[accent])}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
