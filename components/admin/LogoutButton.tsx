'use client';
import { useState } from 'react';
export function LogoutButton() { const [loading,setLoading]=useState(false); return <button onClick={async()=>{setLoading(true); await fetch('/api/admin/logout',{method:'POST'}); location.href='/admin/login';}} className="min-h-11 rounded-full border border-white/25 px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white">{loading?'Keluar...':'Keluar'}</button>; }
