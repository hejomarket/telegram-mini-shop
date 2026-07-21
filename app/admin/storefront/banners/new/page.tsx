import { requireAdminSession } from '../../../../../lib/admin/auth';
import { getRuntimeMode } from '../../../../../lib/supabase/server';
import { listActiveAdminProductsForDestinations } from '../../../../../lib/products/repository';
import { normalizeCategoryValue } from '../../../../../lib/products/categories';
import { BannerForm } from '../../../../../components/admin/banner/BannerForm';
export default async function NewBannerPage(){ await requireAdminSession(); const products=await listActiveAdminProductsForDestinations(); const categories=[...new Set(products.map(p=>p.category).filter((v):v is string=>Boolean(v)).map(normalizeCategoryValue).filter((v):v is string=>Boolean(v)))]; return <section className="space-y-5"><h1 className="text-3xl font-black">Buat Banner</h1><BannerForm mode="create" products={products} categories={categories} disabled={getRuntimeMode()==='demo'}/></section> }
