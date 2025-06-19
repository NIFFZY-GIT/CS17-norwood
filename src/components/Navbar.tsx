'use client';

// ✅ IMPORT usePathname
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// ICONS
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { User, ShoppingCart, LayoutDashboard, LogOut } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  // ✅ GET THE CURRENT PATHNAME
  const pathname = usePathname(); 

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // ✅ THIS IS THE CRITICAL FIX
  // The useEffect hook will now re-run whenever the pathname changes,
  // which includes after login/logout redirects and any other navigation.
  useEffect(() => {
    const checkUserSession = async () => {
      console.log("--- NAVBAR: Checking user session... ---");
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        
        if (res.ok) {
          const data = await res.json();
          console.log("NAVBAR: Session found, setting logged in state.", data);
          setIsLoggedIn(true);
          setUserEmail(data.username);
          setUserRole(data.role);
        } else {
          console.log("NAVBAR: No session found, setting logged out state.");
          setIsLoggedIn(false);
          setUserEmail(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("NAVBAR: Failed to fetch session:", error);
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserRole(null);
      }
    };
    checkUserSession();
  }, [pathname]); // ✅ ADD 'pathname' TO THE DEPENDENCY ARRAY

  // The rest of your Navbar component is correct and does not need changes.
  // ... (other useEffects, handlers, and JSX)

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  // Close profile dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserRole(null);
    setIsProfileMenuOpen(false);
    router.refresh();
  };

  const navLinks = [
    { path: "/", label: "HOME" },
    { path: "/Products", label: "PRODUCTS" },
    { path: "/Our-Story", label: "OUR STORY" },
    { path: "/Careers", label: "CAREERS" },
    { path: "/Contact-Us", label: "CONTACT US" },
  ];

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 w-full z-50 px-6 sm:px-10 flex items-center transition-all duration-300 ${
        isScrolled || menuOpen ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full h-20">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Norwood Empire Logo"
              width={60}
              height={50}
              priority
            />
          </Link>
          <span className="font-bold text-2xl sm:text-3xl text-green-700">
            NORWOOD EMPIRE
          </span>
        </div>

        {/* Desktop Links (Central) */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <motion.div key={link.path} whileHover={{ scale: 1.05 }} className="relative group">
              <Link href={link.path} className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors">
                {link.label}
              </Link>
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-green-500 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Action Buttons (Right Side) */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Cart Button */}
              <Link href="/cart" aria-label="View Cart">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-full hover:bg-green-100 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-green-700" />
                </motion.div>
              </Link>
              
              {/* Profile Button & Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <motion.button onClick={() => setIsProfileMenuOpen(prev => !prev)} aria-label="Open Profile Menu" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <div className="p-3 rounded-full hover:bg-green-100 transition-colors">
                    <User className="h-6 w-6 text-green-700" />
                  </div>
                </motion.button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200/50 p-2 z-50"
                    >
                      {/* Signed in as... */}
                      <div className="px-3 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="font-medium text-gray-800 truncate">{userEmail}</p>
                      </div>
                      
                      {/* Dropdown Links */}
                      <div className="py-1">
                        {userRole === 'admin' && (
                          <Link href="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                              <LayoutDashboard className="h-4 w-4 text-gray-500"/>
                              <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-gray-200 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <LogOut className="h-4 w-4"/>
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Login Button */
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
              >
                Login
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden">
          <button onClick={toggleMenu} className="text-3xl text-green-700" aria-label="Toggle Menu">
            {menuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>

        {/* Mobile Slide-Out */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl flex flex-col p-8 z-40 md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={closeMenu} aria-label="Close Menu" className="text-3xl text-green-700">
                  <HiOutlineX />
                </button>
              </div>
              <div className="flex flex-col space-y-6 flex-grow">
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path} onClick={closeMenu} className="text-green-700 font-semibold text-xl hover:text-green-900 transition">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-200">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="px-2">
                       <p className="text-sm text-gray-500">Signed in as</p>
                       <p className="font-medium text-gray-800 truncate">{userEmail}</p>
                    </div>
                    {userRole === 'admin' && (
                      <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-3 text-green-700 font-semibold text-xl hover:text-green-900 transition">
                        <LayoutDashboard className="h-6 w-6"/>
                        <span>DASHBOARD</span>
                      </Link>
                    )}
                    <Link href="/cart" onClick={closeMenu} className="flex items-center gap-3 text-green-700 font-semibold text-xl hover:text-green-900 transition">
                      <ShoppingCart className="h-6 w-6"/>
                      <span>CART</span>
                    </Link>
                     <button onClick={handleLogout} className="flex items-center gap-3 w-full text-red-600 font-semibold text-xl hover:text-red-800 transition">
                      <LogOut className="h-6 w-6"/>
                      <span>LOGOUT</span>
                    </button>
                  </div>
                ) : (
                   <Link href="/login" onClick={closeMenu} className="flex items-center gap-3 text-green-700 font-semibold text-xl hover:text-green-900 transition">
                      <User className="h-6 w-6"/>
                      <span>LOGIN</span>
                    </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;