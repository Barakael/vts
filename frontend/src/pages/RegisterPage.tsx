import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api/auth';
import AuthField from '../components/forms/AuthField';
import AuthForm from '../components/forms/AuthForm';

const emptyForm = { name: '', email: '', password: '', password_confirmation: '' };

type Keys = keyof typeof emptyForm;

export default function RegisterPage() {
  const [form, setForm] = useState(emptyForm);
  const update = (key: Keys) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register(form);
  };

  return (
    <AuthForm
      title="Create account"
      subtitle="Join the team"
      submitLabel="Get started"
      onSubmit={handleSubmit}
      footer={<span>Already registered? <Link className="font-semibold text-slate-900" to="/login">Sign in</Link></span>}
    >
      <AuthField label="Name" value={form.name} onChange={update('name')} required autoComplete="name" />
      <AuthField label="Email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
      <AuthField label="Password" type="password" value={form.password} onChange={update('password')} required autoComplete="new-password" />
      <AuthField label="Confirm password" type="password" value={form.password_confirmation} onChange={update('password_confirmation')} required autoComplete="new-password" />
    </AuthForm>
  );
}
