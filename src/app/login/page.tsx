// src/app/login/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation';

// ... (rest of your imports like icons, if any)

// This new component contains the actual form and logic using useSearchParams
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to get search params
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/dashboard'); // Default redirect destination

  useEffect(() => {
    // This effect runs on the client after searchParams are available
    const redirectParam = searchParams.get('redirect_to');
    if (redirectParam) {
      // It's good practice to validate redirectParam to prevent open redirect vulnerabilities
      // For example, ensure it's a relative path or a whitelisted domain.
      // For simplicity, this example uses it directly.
      setRedirectTo(decodeURIComponent(redirectParam));
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // const data = await res.json(); // If your API returns data like user info
        router.push(redirectTo); // Redirect to the intended page or dashboard
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  // The JSX for the form
  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl rounded-xl p-8 md:p-10 space-y-6"
    >
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">
        Welcome Back
      </h2>

      {error && (
        <div
          className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
          role="alert"
        >
          <span className="font-medium">Login Failed:</span> {error}
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
          placeholder="your.username"
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
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
          placeholder="••••••••"
          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          disabled={isLoading}
        />
        {/* <div className="text-right mt-2">
          <a
            href="#" // Consider making this a real link or button
            className="text-sm text-sky-500 hover:underline dark:text-sky-400"
          >
            Forgot Password?
          </a>
        </div> */}
      </div>

      <button
        type="submit"
        className={`w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            {/* You might want to add a spinner icon here */}
            Logging In...
          </span>
        ) : (
          'Login'
        )}
      </button>

      {/* <p className="text-sm text-center text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <a
          href="/register" // Use Next.js Link component for internal navigation if preferred
          className="font-medium text-sky-500 hover:underline dark:text-sky-400"
        >
          Sign up
        </a>
      </p> */}
    </form>
  );
}

export default function LoginPage() {
  // The 'use client' directive at the top of the file makes LoginPage a Client Component.
  // It can now wrap the component using useSearchParams in a Suspense boundary.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4">
      {/* Suspense fallback will be shown while searchParams are being resolved */}
      <Suspense fallback={
        <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl rounded-xl p-8 md:p-10 space-y-6 animate-pulse">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">
            Loading...
          </h2>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-12 bg-sky-400 dark:bg-sky-500 rounded"></div>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}