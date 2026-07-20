import { notFound } from 'next/navigation';
import { requireAdminSession } from '../../../../lib/admin/auth';
import { getRuntimeMode } from '../../../../lib/supabase/server';
import { getAdminProduct } from '../../../../lib/products/repository';
import { formatAdminDate } from '../../../../lib/admin/format';
import { ProductForm } from '../../../../components/admin/product/ProductForm';
export default async function EditProductPage({params}:{params:Promise<{productId:string}>}){ await requireAdminSession(); const {productId}=await params; const product=await getAdminProduct(productId); if(!product) notFound(); return <section className="space-y-5"><div><h1 className="text-3xl font-black">Edit Produk</h1><p className="font-semibold text-soia-green/60">ID: {product.id} · Dibuat: {product.createdAt?formatAdminDate(product.createdAt):'-'} · Diperbarui: {product.updatedAt?formatAdminDate(product.updatedAt):'-'}</p></div><ProductForm mode="edit" product={product} disabled={getRuntimeMode()==='demo'}/></section> }
