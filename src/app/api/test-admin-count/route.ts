// Test endpoint to verify admin count
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({
      message: 'Admin count test successful',
      adminCount: stats.totalAdmins,
      allStats: stats
    });
  } catch (error) {
    console.error('Error testing admin count:', error);
    return NextResponse.json(
      { error: 'Failed to get admin count' },
      { status: 500 }
    );
  }
}
