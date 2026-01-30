import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import AuthField from '../components/forms/AuthField';
import AuthForm from '../components/forms/AuthForm';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', password_confirmation: '' };

type Keys = keyof typeof emptyForm;

export default function RegisterPage() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const update = (key: Keys) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to register. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Create account"
      subtitle="Join the team"
      submitLabel="Get started"
      onSubmit={handleSubmit}
      loading={submitting}
      error={error}
      footer={<span>Already registered? <Link className="font-semibold text-slate-900" to="/dashboard">Open the dashboard</Link></span>}
    >
      <AuthField label="Name" value={form.name} onChange={update('name')} required autoComplete="name" />
      <AuthField label="Email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
      <AuthField label="Password" type="password" value={form.password} onChange={update('password')} required autoComplete="new-password" />
      <AuthField label="Confirm password" type="password" value={form.password_confirmation} onChange={update('password_confirmation')} required autoComplete="new-password" />
    </AuthForm>
  );
}
