'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'publisher'>('editor');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate email ends with @gmail.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email.trim())) {
      setError('Invalid email: Must be a valid Gmail address (ending in @gmail.com)');
      setIsLoading(false);
      return;
    }

    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters long');
      setIsLoading(false);
      return;
    }

    // Simulate login by setting the user-role cookie
    document.cookie = `user-role=${role}; path=/; max-age=31536000`;
    
    // Redirect to preview page
    setTimeout(() => {
      router.push('/preview/home');
      router.refresh();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      {/* Skip links for keyboard accessibility */}
      <a href="#login-card" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md">
        Skip to login form
      </a>

      <div 
        id="login-card"
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-2xl mb-4 shadow-lg shadow-blue-500/20">
            P
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to Page Studio</h1>
          <p className="text-sm text-slate-400 mt-1.5">Sign in to edit and preview your pages</p>
        </div>

        {error && (
          <div 
            className="bg-red-950/60 border border-red-800/80 text-red-200 p-3 rounded-lg flex items-start gap-2 text-xs"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-slate-400 mb-1.5">
              Gmail Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500" aria-hidden="true">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm transition-all placeholder-slate-600"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500" aria-hidden="true">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm transition-all placeholder-slate-600"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label htmlFor="login-role-select" className="block text-xs font-semibold text-slate-400 mb-1.5">
              Simulate Workspace Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500" aria-hidden="true">
                <Shield className="w-4 h-4" />
              </span>
              <select
                id="login-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm transition-all"
              >
                <option value="viewer">Viewer (Read Only)</option>
                <option value="editor">Editor (Write & Reorder)</option>
                <option value="publisher">Publisher (Publish Releases)</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-lg py-2.5 text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all focus:outline-none focus:ring-4 focus:ring-blue-800 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
