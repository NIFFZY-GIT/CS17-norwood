import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
// No need to import getSession, redirect, or DashboardLayout in the page file anymore.

// This page is now a simple component that just returns its own content.
// The layout.tsx file handles the session, sidebar, and overall page structure.
export default async function AnalyticsPage() {
  
  // Notice there is NO <DashboardLayout> wrapper here.
  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Site Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Detailed insights into your site&apos;s performance.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <AnalyticsChart />
        
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-6">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white mb-3 sm:mb-4">More Stats Coming Soon...</h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            We are working on adding more detailed analytics like top referrers, device breakdown, and real-time visitors.
          </p>
        </div>
      </div>
    </>
  );
}