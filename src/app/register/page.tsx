'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed.' }));
        setError(errorData.message || 'Something went wrong.');
      }
    } catch {
      setError('Unexpected error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
   <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#1e392a] via-[#2f5c45] to-[#4c8c6b]">



   <div className="relative w-full max-w-md bg-green-900/50 backdrop-blur-lg border border-green-700/40 rounded-3xl p-10 md:p-12 shadow-2xl shadow-green-900/30 transition duration-300 hover:scale-[1.01]">






        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-green-900 rounded-full shadow-lg overflow-hidden border-4 border-green-300 flex items-center justify-center">
          <img
            src="/tea.png"
            alt="Tea Avatar"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-center text-3xl font-bold text-green-300 mb-6 font-serif tracking-wide">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-200 rounded-md px-4 py-2">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-green-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="tea.lover123"
              className="mt-1 w-full rounded-lg border border-green-600 bg-green-900 bg-opacity-30 px-4 py-2 text-green-200 placeholder-green-400 focus:ring-4 focus:ring-green-500 focus:border-green-400 focus:bg-green-800 focus:text-green-100 transition duration-300 outline-none"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={isLoading}
              required
              autoComplete="username"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-green-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-green-600 bg-green-900 bg-opacity-30 px-4 py-2 text-green-200 placeholder-green-400 focus:ring-4 focus:ring-green-500 focus:border-green-400 focus:bg-green-800 focus:text-green-100 transition duration-300 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-green-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-green-600 bg-green-900 bg-opacity-30 px-4 py-2 text-green-200 placeholder-green-400 focus:ring-4 focus:ring-green-500 focus:border-green-400 focus:bg-green-800 focus:text-green-100 transition duration-300 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={isLoading}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              className="mt-1 w-full rounded-lg border border-green-600 bg-green-900 bg-opacity-30 px-4 py-2 text-green-200 placeholder-green-400 focus:ring-4 focus:ring-green-500 focus:border-green-400 focus:bg-green-800 focus:text-green-100 transition duration-300 outline-none"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-lg ${
              isLoading ? 'opacity-60 cursor-not-allowed' : 'shadow-green-700/50'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-green-400">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-semibold text-green-300 hover:text-green-100 hover:underline transition duration-300"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}