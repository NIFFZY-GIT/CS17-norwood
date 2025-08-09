// src/app/dashboard/layout.tsx
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardLayoutComponent from '@/components/dashboard/DashboardLayout';

// This is the correct, simple layout file.
// Notice we have removed the unused imports for Header and Footer.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // This check is perfect.
  if (!session?.userId) {
    redirect('/login');
  }

  // Pass the session and children to the client component that handles the UI.
  return (
    <DashboardLayoutComponent session={session}>
      {children}
    </DashboardLayoutComponent>
  );
}