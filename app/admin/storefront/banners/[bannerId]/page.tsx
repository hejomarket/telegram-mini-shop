import { notFound } from 'next/navigation';
import { requireAdminSession } from '../../../../../lib/admin/auth';
import { formatAdminDate } from '../../../../../lib/admin/format';
import { getRuntimeMode } from '../../../../../lib/supabase/server';
import { getBannerById } from '../../../../../lib/merchandising/repository';
import type { StorefrontBannerRow } from '../../../../../lib/merchandising/types';
import { getBannerScheduleState } from '../../../../../lib/merchandising/schedule';
import { listActiveAdminProductsForDestinations } from '../../../../../lib/products/repository';
import { normalizeCategoryValue } from '../../../../../lib/products/categories';
import { BannerForm } from '../../../../../components/admin/banner/BannerForm';
import { BannerDeleteButton } from '../../../../../components/admin/banner/BannerDeleteButton';
const stateLabels={active:'Sedang Tayang',scheduled:'Terjadwal',expired:'Berakhir',inactive:'Tidak Aktif'};
export default async function EditBannerPage({params}:{params:Promise<{bannerId:string}>}){ await requireAdminSession(); const {bannerId}=await params; const banner=await getBannerById(bannerId); if(!banner) notFound(); const row=banner as StorefrontBannerRow; const products=await listActiveAdminProductsForDestinations(); const categories=[...new Set(products.map(p=>p.category).filter((v):v is string=>Boolean(v)).map(normalizeCategoryValue).filter((v):v is string=>Boolean(v)))]; return <section className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-black">Edit Banner</h1><p className="font-semibold text-soia-green/60">ID: {row.id} · Dibuat: {formatAdminDate(row.created_at)} · Diperbarui: {formatAdminDate(row.updated_at)}</p><p className="font-semibold text-soia-green/60">Status: {row.is_active?'Aktif':'Tidak Aktif'} · Jadwal: {stateLabels[getBannerScheduleState(row)]}</p></div><BannerDeleteButton bannerId={row.id}/></div><BannerForm mode="edit" banner={row} products={products} categories={categories} disabled={getRuntimeMode()==='demo'}/></section> }
