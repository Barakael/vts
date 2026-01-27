import { InputHTMLAttributes } from 'react';

type Props = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

const base = 'rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring';

export default function AuthField({ label, id, ...rest }: Props) {
  const fieldId = id ?? rest.name ?? label.toLowerCase();
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-600" htmlFor={fieldId}>
      <span className="font-medium text-slate-900">{label}</span>
      <input id={fieldId} className={base} {...rest} />
    </label>
  );
}
