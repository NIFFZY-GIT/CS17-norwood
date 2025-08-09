// src/lib/data.ts
import clientPromise from '@/lib/mongodb';
import { User, Item } from '@/lib/types'; // Renaming to avoid conflict

// --- TYPES FOR DASHBOARD OVERVIEW ---

export interface ChartData {
  date: string;
  count: number;
}

export interface DashboardStats {
  totalItems: number;
  totalAdmins: number;
  totalVacancies: number;
  totalApplications: number;
  itemsLast7Days: ChartData[];
}

// --- FUNCTION FOR DASHBOARD OVERVIEW ---

/**
 * Fetches all necessary statistics for the main dashboard overview from MongoDB.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const [
      totalItems,
      totalAdmins,
      totalVacancies,
      totalApplications,
    ] = await Promise.all([
      db.collection('items').countDocuments(),
      // Count admin users - handle both old (isAdmin: true) and new (role: 'admin') schema
      db.collection('users').countDocuments({ 
        $or: [
          { isAdmin: true },
          { role: 'admin' }
        ]
      }),
      db.collection('vacancies').countDocuments(),
      db.collection('applications').countDocuments(),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const itemsLast7Days = await db.collection('items').aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: '$count' } },
    ]).toArray();
    
    const dateMap = new Map((itemsLast7Days as ChartData[]).map(item => [item.date, item.count]));
    const completeChartData: ChartData[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        completeChartData.push({
            date: dateString,
            count: dateMap.get(dateString) || 0,
        });
    }

    return {
      totalItems,
      totalAdmins,
      totalVacancies,
      totalApplications,
      itemsLast7Days: completeChartData,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      totalItems: 0,
      totalAdmins: 0,
      totalVacancies: 0,
      totalApplications: 0,
      itemsLast7Days: [],
    };
  }
}

// ===================================================================
// --- NEW CODE FOR ANALYTICS PAGE ---
// ===================================================================

// --- TYPES FOR ANALYTICS PAGE ---

// Define the shape of data for the new dual-bar activity chart
export interface ActivityChartPoint {
  date: string;
  users: number;
  items: number;
}

// Define the shape for all data needed by the analytics page
export interface AnalyticsData {
  totalUsers: number;
  totalItems: number;
  totalVacancies: number;
  totalApplications: number;
  recentUsers: User[];
  recentItems: Item[];
  activityLast7Days: ActivityChartPoint[];
}

/**
 * Fetches all necessary statistics and recent activity for the Analytics page.
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const client = await clientPromise;
    const db = client.db();

    // --- 1. Fetch all counts in parallel ---
    const [
      totalUsers,
      totalItems,
      totalVacancies,
      totalApplications,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('items').countDocuments(),
      db.collection('vacancies').countDocuments(),
      db.collection('applications').countDocuments(),
    ]);

    // --- 2. Fetch recent documents in parallel ---
    const [recentUsersRaw, recentItemsRaw] = await Promise.all([
      db.collection('users').find({}, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('items').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

    // --- 3. Fetch data for the chart (Users and Items created in the last 7 days) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // This is a more advanced aggregation pipeline using $unionWith
    const activityLast7Days = await db.collection('items').aggregate([
      // Start with items
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, items: { $sum: 1 } } },
      // Combine with users data from the users collection
      {
        $unionWith: {
          coll: 'users',
          pipeline: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, users: { $sum: 1 } } },
          ],
        },
      },
      // Merge the results grouped by date
      { $group: { _id: '$_id', totalItems: { $sum: '$items' }, totalUsers: { $sum: '$users' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', items: '$totalItems', users: '$totalUsers' } },
    ]).toArray();

    // --- 4. Fill in missing days with 0 counts for a complete chart ---
    const dateMap = new Map((activityLast7Days as ActivityChartPoint[]).map(item => [item.date, { items: item.items, users: item.users }]));
    const completeChartData: ActivityChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        completeChartData.push({
            date: dateString,
            items: dateMap.get(dateString)?.items || 0,
            users: dateMap.get(dateString)?.users || 0,
        });
    }

    return {
      totalUsers,
      totalItems,
      totalVacancies,
      totalApplications,
      // Map the _id from ObjectId to string for client-side use
      recentUsers: recentUsersRaw.map(u => ({ ...u, _id: u._id.toString() })) as User[],
      recentItems: recentItemsRaw.map(i => ({ ...i, _id: i._id.toString() })) as Item[],
      activityLast7Days: completeChartData,
    };

  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    // Return empty data on failure to prevent page from crashing
    return {
      totalUsers: 0,
      totalItems: 0,
      totalVacancies: 0,
      totalApplications: 0,
      recentUsers: [],
      recentItems: [],
      activityLast7Days: [],
    };
  }
}