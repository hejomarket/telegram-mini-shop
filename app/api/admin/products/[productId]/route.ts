import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '../../../../../lib/admin/auth';
import { updateProduct } from '../../../../../lib/products/repository';
type Params={params:Promise<{productId:string}>};
export async function PATCH(request:Request,{params}:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{ const {productId}=await params; const product=await updateProduct(productId, await request.json()); if(!product) return NextResponse.json({message:'Produk tidak ditemukan.'},{status:404}); revalidatePath('/'); revalidatePath('/admin/products'); return NextResponse.json({success:true,product}); }catch(e){ const status=(e as Error & {status?:number}).status ?? 400; return NextResponse.json({message:e instanceof Error?e.message:'Produk belum dapat disimpan.'},{status}); } }
