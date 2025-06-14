// src/app/api/analytics/trends/route.ts
import { NextResponse } from 'next/server'; // NextRequest can be removed if request parameter is removed
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';

// Helper function to check for admin (or appropriate auth)
async function isAuthorized(session: { userId: string } | null): Promise<boolean> {
    if (!session) return false;
    // Replace with your actual authorization logic, e.g., check if user is admin
    // For demo, assume any logged-in user can see this. In prod, restrict.
    // if (process.env.ADMIN_USER_ID && session.userId === process.env.ADMIN_USER_ID) {
    //     return true;
    // }
    return true; // For demo, allow any logged-in user
}

// MODIFIED: Removed 'request' parameter as it was unused
export async function GET() {
    const session = await getSession();
    if (!(await isAuthorized(session))) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (!process.env.MONGODB_DB_NAME) {
        console.error('API analytics trends: MONGODB_DB_NAME is not set');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);
        
        const itemsCollection = db.collection('items');
        // const itemViewEventsCollection = db.collection('itemViewEvents'); // If you implement this

        const analyticsData = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const newItemsCount = await itemsCollection.countDocuments({
                createdAt: {
                    $gte: date,
                    $lt: nextDay,
                },
            });

            // For demo purposes (replace with actual data logic):
            const itemViewsCount = Math.floor(Math.random() * (newItemsCount > 0 ? newItemsCount * 5 : 20)) + newItemsCount * 2;
            // Example of how you might query real view data:
            // const itemViewsCount = await itemViewEventsCollection.countDocuments({
            //     viewedAt: { $gte: date, $lt: nextDay },
            // });

            analyticsData.push({
                name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                newItems: newItemsCount,
                itemViews: itemViewsCount,
            });
        }

        return NextResponse.json(analyticsData);

    } catch (error) {
        console.error('Error fetching analytics trends:', error);
        return NextResponse.json({ message: 'Failed to fetch analytics data' }, { status: 500 });
    }
}