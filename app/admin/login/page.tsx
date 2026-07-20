import { redirect } from 'next/navigation';
import { isAdminConfigured, readAdminSession } from '../../../lib/admin/auth';
import { LoginForm } from '../../../components/admin/LoginForm';
export default async function LoginPage(){ if(await readAdminSession()) redirect('/admin'); return <main className="flex min-h-screen items-center justify-center bg-soia-cream p-4"><section className="w-full max-w-md"><p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.3em] text-soia-green/60">SOIA Admin</p><h1 className="mb-6 text-center text-3xl font-black text-soia-green">Masuk Admin</h1><LoginForm configured={isAdminConfigured()} /></section></main> }
