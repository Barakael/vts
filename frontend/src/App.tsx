import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row">
          <section className="lg:w-1/2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Auth Portal</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              Focused onboarding for your teammates.
            </h1>
            <p className="mt-4 text-base text-slate-500">
              These lightweight forms hit the Laravel Sanctum endpoints you exposed on the backend.
              Keep styling in Tailwind so every page stays small and composable.
            </p>
          </section>

          <section className="flex w-full justify-center lg:w-1/2">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </section>
        </div>
      </div>
    </BrowserRouter>
  );
}
