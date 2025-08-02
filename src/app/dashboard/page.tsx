import { getSession } from '@/lib/session';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { Package, Users, BarChartBig, ArrowUpRight } from 'lucide-react';
import clientPromise from '@/lib/mongodb'; // Import the MongoDB client

// --- THIS FUNCTION IS NOW DYNAMIC ---
// It connects to the database to get a live count of items.
async function getDashboardStats() {
  try {
    if (!process.env.MONGODB_DB_NAME) {
      throw new Error('Server configuration error: MONGODB_DB_NAME is not set.');
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    // --- DYNAMIC DATA ---
    const totalItems = await db.collection('items').countDocuments();

    // --- MOCK DATA (for demonstration) ---
    // In a real app, you would also query your `users` collection or an analytics service.
    const siteVisitors = 4821;
    const newSignUps = 34;

    return {
      totalItems,
      siteVisitors,
      newSignUps,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    // Return safe defaults on error so the page doesn't crash
    return {
      totalItems: 0,
      siteVisitors: 0,
      newSignUps: 0,
    };
  }
}

export default async function DashboardOverviewPage() {
  // Fetch session and stats concurrently for a small performance boost
  const [session, stats] = await Promise.all([
    getSession(),
    getDashboardStats()
  ]);

  if (!session) {
    // Handle case where session is null - redirect should be handled by middleware
    return null;
  }

  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back, {session.username}!</p>
      </header>

      {/* Stats Cards Section - This JSX remains the same, but the data is now live */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Total Items</h3>
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500" />
          </div>
          {/* This number is now dynamic! */}
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">{stats.totalItems}</p>
          <p className="text-xs sm:text-sm text-green-500 flex items-center mt-1">
            <ArrowUpRight size={14} className="mr-1" /> Live count from database
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Site Visitors (30d)</h3>
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">{stats.siteVisitors.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-green-500 flex items-center mt-1">
            <ArrowUpRight size={14} className="mr-1" /> Mock data for now
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">New Sign-ups (30d)</h3>
            <BarChartBig className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">{stats.newSignUps}</p>
          <p className="text-xs sm:text-sm text-red-500 flex items-center mt-1"> Mock data for now </p>
        </div>
      </section>

      {/* Analytics Chart Section */}
      <section>
        <AnalyticsChart />
      </section>
    </>
  );
}