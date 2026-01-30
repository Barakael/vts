import type { InputHTMLAttributes } from 'react';

type Props = {
  label: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const base = 'w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30';

export default function AuthField({ label, hint, id, ...rest }: Props) {
  const fieldId = id ?? rest.name ?? label.toLowerCase();
  return (
    <label className="flex flex-col gap-1.5" htmlFor={fieldId}>
      <div className="flex items-center justify-between text-sm font-medium text-white/90">
        <span>{label}</span>
        {hint && <span className="text-xs text-white/50">{hint}</span>}
      </div>
      <input id={fieldId} className={base} {...rest} />
    </label>
  );
}
