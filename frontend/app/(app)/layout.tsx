import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AppShell from './AppShell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
