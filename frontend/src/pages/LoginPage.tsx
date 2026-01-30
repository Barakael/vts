import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import AuthField from '../components/forms/AuthField';
import AuthForm from '../components/forms/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const update = (key: 'email' | 'password') => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Sign in"
      subtitle="Welcome back"
      submitLabel="Continue"
      onSubmit={handleSubmit}
      loading={submitting}
      error={error}
      footer={<span>Need an account? <Link className="font-semibold text-slate-900" to="/register">Sign up</Link></span>}
    >
      <AuthField label="Email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
      <AuthField label="Password" type="password" value={form.password} onChange={update('password')} required autoComplete="current-password" />
    </AuthForm>
  );
}
