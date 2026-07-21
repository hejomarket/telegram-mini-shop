import { requireAdminSession } from '../../../../../lib/admin/auth';
import { getRuntimeMode } from '../../../../../lib/supabase/server';
import { listActiveAdminProductsForDestinations } from '../../../../../lib/products/repository';
import { BannerForm } from '../../../../../components/admin/banner/BannerForm';
function slugCategory(value:string){return value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-{2,}/g,'-').replace(/^-|-$/g,'');}
export default async function NewBannerPage(){ await requireAdminSession(); const products=await listActiveAdminProductsForDestinations(); const categories=[...new Set(products.map(p=>p.category).filter((v):v is string=>Boolean(v)).map(slugCategory))]; return <section className="space-y-5"><h1 className="text-3xl font-black">Buat Banner</h1><BannerForm mode="create" products={products} categories={categories} disabled={getRuntimeMode()==='demo'}/></section> }
