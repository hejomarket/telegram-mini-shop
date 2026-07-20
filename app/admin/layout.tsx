import Link from 'next/link';
import { readAdminSession } from '../../lib/admin/auth';
import { LogoutButton } from '../../components/admin/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await readAdminSession();
  if (!session) return children;
  return (
    <div className="min-h-screen bg-soia-cream text-soia-green">
      <header className="sticky top-0 z-30 bg-soia-green px-4 py-3 text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/admin" className="font-black focus:outline-none focus:ring-2 focus:ring-white">SOIA Admin</Link>
          <nav className="flex items-center gap-2" aria-label="Navigasi admin">
            <Link className="min-h-11 rounded-full px-4 py-3 text-sm font-bold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white" href="/admin">Dashboard</Link>
            <Link className="min-h-11 rounded-full px-4 py-3 text-sm font-bold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white" href="/admin/orders">Pesanan</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
