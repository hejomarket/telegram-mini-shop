'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function submit(formData: FormData) {
    setError(''); setLoading(true);
    const res = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }), headers: { 'content-type': 'application/json' } });
    setLoading(false);
    if (res.ok) { router.push('/admin'); router.refresh(); return; }
    const body = await res.json().catch(() => ({})); setError(body.message ?? 'Email atau kata sandi salah.');
  }
  return <form action={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-card">
    {!configured ? <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Konfigurasi admin belum lengkap.</p> : null}
    <label className="block text-sm font-bold text-soia-green">Email Admin<input name="email" type="email" required disabled={!configured || loading} className="mt-2 min-h-11 w-full rounded-2xl border border-soia-green/15 px-4 outline-none focus:ring-2 focus:ring-soia-green" /></label>
    <label className="block text-sm font-bold text-soia-green">Kata Sandi<input name="password" type="password" required disabled={!configured || loading} className="mt-2 min-h-11 w-full rounded-2xl border border-soia-green/15 px-4 outline-none focus:ring-2 focus:ring-soia-green" /></label>
    {error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}
    <button disabled={!configured || loading} className="min-h-11 w-full rounded-full bg-soia-green px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Memproses...' : 'Masuk'}</button>
  </form>;
}
