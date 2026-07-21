'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Users, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem('user');
      const loggedInUser = stored ? JSON.parse(stored) : null;
      if (loggedInUser?.role === 'Employee') {
        router.push('/employees');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'hr' | 'employee') => {
    const creds = {
      admin: { email: 'admin@ems.com', password: 'Admin@123' },
      hr: { email: 'hr@ems.com', password: 'Hr@12345' },
      employee: { email: 'james@ems.com', password: 'Emp@12345' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/95 via-brand/40 to-sidebar/90" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <span className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-light">
            Workforce
          </span>
          <h1 className="font-display text-5xl font-bold leading-tight">EMS</h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Manage your workforce with secure authentication, role-based access, and organizational hierarchy.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Shield size={16} /> JWT Secured
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} /> RBAC Enabled
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Workforce</span>
            <h1 className="font-display text-3xl font-bold text-foreground">EMS</h1>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Enter your credentials to access the portal</p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Demo Accounts</p>
            <div className="flex flex-wrap gap-2">
              {(['admin', 'hr', 'employee'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium capitalize text-muted transition-colors hover:border-brand hover:text-brand"
                >
                  {role === 'admin' ? 'Super Admin' : role === 'hr' ? 'HR Manager' : 'Employee'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
