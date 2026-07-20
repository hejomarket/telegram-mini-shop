import { requireAdminSession } from '../../../../lib/admin/auth';
import { getRuntimeMode } from '../../../../lib/supabase/server';
import { ProductForm } from '../../../../components/admin/product/ProductForm';
export default async function NewProductPage(){ await requireAdminSession(); return <section className="space-y-5"><h1 className="text-3xl font-black">Buat Produk</h1><ProductForm mode="create" disabled={getRuntimeMode()==='demo'}/></section> }
