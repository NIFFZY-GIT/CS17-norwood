'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
// MODIFIED: Removed 'User' icon, kept Mail, Lock, Coffee
import { Mail, Lock, Coffee } from 'lucide-react';
import Image from 'next/image';

// --- Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

// --- Slideshow Left Side Component ---
const ImageSlideshow = () => {
  const images = ['/bite1.png', '/bathalabite.png', '/logo.png'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="Rotating Image"
          fill
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          priority={index === 0}
          sizes="(max-width: 1024px) 0vw, 50vw"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
    </div>
  );
};

// --- Main Register Page ---
export default function RegisterPage() {
  const router = useRouter();
  // MODIFIED: Removed 'username' from the form state
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        // MODIFIED: Removed 'username' from the request body
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const data = await res.json().catch(() => ({ message: 'Registration failed.' }));
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Unexpected error. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 text-white overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 transition duration-300" style={{ background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.2), transparent 80%)` }} />

      <div className="relative z-10 w-full max-w-4xl flex min-h-[640px] bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-green-500/20 shadow-2xl overflow-hidden">
        <div className="hidden lg:block lg:w-1/2 relative">
          <ImageSlideshow />
        </div>

        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="inline-block p-4 bg-green-500/10 rounded-full mb-4">
                <Coffee className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Join Norwood</h1>
              <p className="text-gray-400 mt-2">Create an account to get started.</p>
            </motion.div>

            {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2">{error}</motion.div>}

            <motion.form onSubmit={handleRegister} variants={containerVariants} className="space-y-5">
              
              {/* REMOVED: The entire username input field has been deleted from here. */}
            
              <motion.div variants={itemVariants} className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3 bg-gray-800/60 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isLoading} required />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" placeholder="Password (min. 8 characters)" className="w-full pl-12 pr-4 py-3 bg-gray-800/60 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 outline-none" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={isLoading} required minLength={8} />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" placeholder="Confirm Password" className="w-full pl-12 pr-4 py-3 bg-gray-800/60 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 outline-none" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} disabled={isLoading} required />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button type="submit" className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20 hover:shadow-emerald-500/40'}`} disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Create Account'}
                </button>
              </motion.div>
            </motion.form>

            <motion.p variants={itemVariants} className="mt-8 text-sm text-center text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-green-400 hover:text-green-300 hover:underline underline-offset-2">Log In</a>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}