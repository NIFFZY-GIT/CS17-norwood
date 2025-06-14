'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu as MenuIcon } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface DashboardLayoutProps {
  children: ReactNode;
  session: UserSession | null; // Session is a required prop
}

export default function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar
        username={session?.username}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 w-full min-w-0"> {/* min-w-0 prevents flexbox overflow issues */}
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between mb-4 sm:mb-6 p-2 -mx-2 sm:mx-0 rounded-md bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20"> {/* Increased z-index */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            aria-label="Open sidebar"
          >
            <MenuIcon size={24} />
          </button>
          <Link href="/dashboard" className="text-lg font-semibold text-sky-500 hover:text-sky-400">
            MyDashboard
          </Link>
          <div className="w-8 h-8"></div> {/* Spacer to balance hamburger */}
        </div>
        {children}
      </main>
    </div>
  );
}