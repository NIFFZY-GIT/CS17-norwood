// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // ✅ THE FIX IS HERE: Manually create the object for the API
      const apiData = {
        username: form.username,
        email: form.email,
        password: form.password,
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (res.ok) {
        router.push('/login?status=registered');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  // The rest of your component remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl rounded-xl p-8 md:p-10 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">
          Create an Account
        </h2>

        {error && (
          <div
            className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
            role="alert"
          >
            <span className="font-medium">Registration Failed:</span> {error}
          </div>
        )}

        <div>
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="choose.a.username"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>

        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-teal-500 hover:underline dark:text-teal-400"
          >
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}