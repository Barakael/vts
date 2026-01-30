import type { FormEvent, ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer?: ReactNode;
  error?: string | null;
  loading?: boolean;
};

export default function AuthForm({ title, subtitle, submitLabel, onSubmit, children, footer, error, loading }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-6 rounded-3xl border border-white/20 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl"
    >
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">{subtitle}</p>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
      {error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Please wait…' : submitLabel}
      </button>
      {footer && <div className="text-center text-sm text-white/60">{footer}</div>}
    </form>
  );
}
