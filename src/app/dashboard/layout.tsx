import { getSession } from '@/lib/session'; // Your server-side session function
import { redirect } from 'next/navigation';
import DashboardLayoutComponent from '@/components/dashboard/DashboardLayout'; // A better name

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/login');
  }

  // The DashboardLayoutComponent from your components folder adds the sidebar
  // and the main content area with its padding.
  return (
    <DashboardLayoutComponent session={session}>
      {children}
    </DashboardLayoutComponent>
  );
}