import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../api/auth';
import AuthField from '../components/forms/AuthField';
import AuthForm from '../components/forms/AuthForm';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const update = (key: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(form);
  };

  return (
    <AuthForm
      title="Sign in"
      subtitle="Welcome back"
      submitLabel="Continue"
      onSubmit={handleSubmit}
      footer={<span>Need an account? <Link className="font-semibold text-slate-900" to="/register">Sign up</Link></span>}
    >
      <AuthField label="Email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
      <AuthField label="Password" type="password" value={form.password} onChange={update('password')} required autoComplete="current-password" />
    </AuthForm>
  );
}
