import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Login form submitted with:', { email, password });
      
      // Ensure CSRF token is available
      console.log('Ensuring CSRF token...');
      await client.get('/sanctum/csrf-cookie');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for cookie
      
      console.log('Making login request...');
      const response = await login({ email, password });
      console.log('Login response:', response);
      
      await refreshUser();
      
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side - Branding */}
      <div 
        className="hidden lg:flex"
        style={{
          width: '50%',
          background: 'linear-gradient(to bottom right, #111827, #1e3a5f, #111827)',
          padding: '48px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}>
              <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', letterSpacing: '-0.025em' }}>VTS</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', lineHeight: 1.1, marginBottom: '24px' }}>
            Vehicle Tracking
            <br />
            <span style={{ 
              background: 'linear-gradient(to right, #60a5fa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Made Simple
            </span>
          </h1>
          <p style={{ fontSize: '18px', color: '#d1d5db', maxWidth: '400px', lineHeight: 1.6 }}>
            Monitor your entire fleet in real-time. Track locations, analyze routes, 
            and optimize operations from a single dashboard.
          </p>
          
          {/* Features list */}
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Real-time GPS tracking',
              'Historical route playback',
              'Instant alerts & notifications',
              'Detailed analytics & reports',
            ].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#d1d5db' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '12px', height: '12px', color: '#60a5fa' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span style={{ fontSize: '15px' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 10, fontSize: '14px', color: '#9ca3af' }}>
          © {new Date().getFullYear()} Vehicle Tracking System. All rights reserved.
        </div>
      </div>

      {/* Right side - Login form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>VTS</span>
            </div>
          </div>

          {/* Form header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }} className="lg:text-left">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Welcome back</h2>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '15px' }}>Sign in to your account to continue</p>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Password
                </label>
                <a href="/forgot-password" style={{ fontSize: '14px', color: '#2563eb', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? (
                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <input
                id="remember"
                type="checkbox"
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
              />
              <label htmlFor="remember" style={{ marginLeft: '8px', fontSize: '14px', color: '#4b5563' }}>
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                color: 'white',
                fontWeight: '500',
                fontSize: '15px',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '500', color: '#2563eb', textDecoration: 'none' }}>
              Create one now
            </Link>
          </p>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
