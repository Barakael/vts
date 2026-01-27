import { FormEvent, ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthForm({ title, subtitle, submitLabel, onSubmit, children, footer }: Props) {
  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-lg">
      <header className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{subtitle}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
        {submitLabel}
      </button>
      {footer && <div className="text-center text-sm text-slate-500">{footer}</div>}
    </form>
  );
}
