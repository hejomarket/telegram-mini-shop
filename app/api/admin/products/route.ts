import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '../../../../lib/admin/auth';
import { createProduct } from '../../../../lib/products/repository';
export async function POST(request:Request){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{ const product=await createProduct(await request.json()); revalidatePath('/'); revalidatePath('/admin/products'); return NextResponse.json({success:true,product},{status:201}); }catch(e){ return NextResponse.json({message:e instanceof Error?e.message:'Produk belum dapat dibuat.'},{status:400}); } }
