'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Optional: For icons, you might use a library like react-icons
// import { FiUser, FiLock, FiMail, FiLogIn } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    // email: '', // Optional: Add email field
    password: '',
    confirmPassword: '', // Good practice for registration
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

    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          // email: form.email, // Send email if using
          password: form.password,
        }), // Only send necessary fields to API
      });

      if (res.ok) {
        // const data = await res.json(); // If your API returns data
        router.push('/login?registered=true'); // Redirect to login, maybe with a success query param
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed. Please try again.' }));
        setError(errorData.message || 'Registration failed. Username might be taken or an error occurred.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4">
      {/* Optional: Logo or App Name */}
      {/* <div className="mb-8">
        <h1 className="text-5xl font-bold text-white">MyApp</h1>
      </div> */}

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

        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Username
          </label>
          <div className="relative">
            {/* Optional Icon: 
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiUser className="w-5 h-5 text-slate-400" />
            </div> 
            */}
            <input
              id="username"
              type="text"
              placeholder="choose.a.username"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              // Add pl-10 if using an icon
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Optional Email Field - Uncomment to use
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <div className="relative">
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
        </div>
        */}

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <div className="relative">
            {/* Optional Icon:
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiLock className="w-5 h-5 text-slate-400" />
            </div>
            */}
            <input
              id="password"
              type="password"
              placeholder="Create a strong password"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              // Add pl-10 if using an icon
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8} // Good practice: enforce minimum password length
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              {/* Optional: Spinner Icon */}
              Creating Account...
            </span>
          ) : (
            'Register'
          )}
        </button>

        {/* Link to Login Page */}
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <a
            href="/login" // Link to your login page
            className="font-medium text-teal-500 hover:underline dark:text-teal-400"
          >
            Log In
          </a>
        </p>
      </form>
    </div>
  );
}