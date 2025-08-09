// src/app/dashboard/page.tsx
import { getSession } from '@/lib/session';
import { getDashboardStats } from '@/lib/data';
import { Package, ShieldCheck, Briefcase, FileText } from 'lucide-react';
import DashboardChart from '@/components/dashboard/DashboardChart';

// This is an async Server Component, so we can fetch data directly
export default async function DashboardOverviewPage() {
  // Get session for personalization and stats for the dashboard
  const [session, stats] = await Promise.all([
    getSession(),
    getDashboardStats(),
  ]);

  // Log the admin count for verification
  console.log(`📊 Dashboard Stats - Admin Count: ${stats.totalAdmins}`);

  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        {session?.username && (
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back, {session.username}!
          </p>
        )}
      </header>

      {/* Stats Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Items Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Total Items</h3>
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
            {stats.totalItems.toLocaleString()}
          </p>
        </div>

        {/* Total Admins Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Admin Users</h3>
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
            {stats.totalAdmins.toLocaleString()}
          </p>
        </div>

        {/* Total Vacancies Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Open Vacancies</h3>
            <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
            {stats.totalVacancies.toLocaleString()}
          </p>
        </div>

        {/* Total Applications Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Applications</h3>
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
            {stats.totalApplications.toLocaleString()}
          </p>
        </div>
      </section>

      {/* Analytics Chart Section */}
      <section>
        <DashboardChart data={stats.itemsLast7Days} />
      </section>
    </>
  );
}