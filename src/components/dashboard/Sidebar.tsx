// components/dashboard/Sidebar.tsx
'use client';
import Link from 'next/link';
import { LayoutDashboard, Package, BarChart3, LogOut, Settings, X as XIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, FileText } from "lucide-react";


const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/items', label: 'My Items', icon: Package },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/vacancies', label: 'Vacancies', icon: Briefcase },
  { href: '/dashboard/applications', label: 'Applications', icon: FileText }
  
];

interface SidebarProps {
  username?: string;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ username, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/login');
    } else {
      console.error("Logout failed");
      alert("Logout failed. Please try again.");
    }
  };

  const baseClasses = `bg-slate-800 text-slate-100 p-4 sm:p-6 flex flex-col 
                       fixed left-0 z-40 w-64 transition-transform duration-300 ease-in-out
                       top-20 h-[calc(100vh-theme(space.20))]`; // Correctly uses top-20 and calculates height

  const desktopClasses = "md:translate-x-0";
  const mobileClasses = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside id="sidebar-menu" className={`${baseClasses} ${desktopClasses} ${mobileClasses}`}>
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <Link href="/dashboard" className="text-xl sm:text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
            MyDashboard
          </Link>
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-300 hover:text-white p-1 -mr-1"
            aria-label="Close sidebar"
          >
            <XIcon size={24} />
          </button>
        </div>
        {username && <p className="text-sm text-slate-400 -mt-4 mb-4">Welcome, {username}</p>}
        
        <nav className="flex-grow overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li key={item.label} className="mb-2">
                <Link
                  href={item.href}
                  onClick={() => { if (isMobileOpen) onMobileClose(); }}
                  className={`flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700 transition-colors ${
                    pathname === item.href ? 'bg-sky-500 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 mt-4 rounded-md text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}