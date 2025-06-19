'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Mail, Lock, Coffee } from 'lucide-react';
import Image from 'next/image';

// --- Motion Variants (No changes here) ---
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

// --- NEW: Image Slideshow Component (Left Side) ---
const ImageSlideshow = () => {
  const images = [
    '/bite1.png',
    '/bathalabite.png',
   '/logo.png',
     // Added another image for variety
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="A calming image related to tea"
          fill
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          priority={index === 0}
          sizes="(max-width: 1024px) 0vw, 50vw"
        />
      ))}
      {/* Overlay for aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
    </div>
  );
};


// --- Main Login Page Component ---
export default function ModernLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (form.email === 'test@example.com' && form.password === 'password') {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 text-white overflow-hidden">
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(45, 212, 191, 0.15), transparent 80%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl flex min-h-[600px] bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-teal-500/20 shadow-2xl shadow-teal-500/10 overflow-hidden">
        
        {/* MODIFIED: Left Side now uses the new Slideshow component */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <ImageSlideshow />
        </div>

        {/* Right Side: Login Form (No changes here) */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="inline-block p-4 bg-teal-500/10 rounded-full mb-4">
                <Coffee className="w-10 h-10 text-teal-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Welcome Back</h1>
              <p className="text-gray-400 mt-2">Sign in to steep in flavor.</p>
            </motion.div>
            
            {error && (
              <motion.div 
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                className="mb-4 text-sm text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2">
                {error}
              </motion.div>
            )}

            <motion.form onSubmit={handleLogin} variants={containerVariants} className="space-y-5">
              <motion.div variants={itemVariants} className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/60 rounded-lg border border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 transition-all duration-300 outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/60 rounded-lg border border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 transition-all duration-300 outline-none"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out ${
                    isLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/20 hover:shadow-emerald-500/40'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </motion.div>
            </motion.form>

            <motion.p variants={itemVariants} className="mt-8 text-sm text-center text-gray-400">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-semibold text-teal-400 hover:text-teal-300 hover:underline underline-offset-2">
                Register
              </a>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}