import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminApi } from '../../../../../../lib/admin/auth';
import { productStatusSchema } from '../../../../../../lib/products/validation';
import { updateProductStatus } from '../../../../../../lib/products/repository';
type Params={params:Promise<{productId:string}>};
export async function PATCH(request:Request,{params}:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{ const {productId}=await params; const patch=productStatusSchema.parse(await request.json()); const product=await updateProductStatus(productId,patch); revalidatePath('/'); revalidatePath('/admin/products'); return NextResponse.json({success:true,product}); }catch(e){ return NextResponse.json({message:e instanceof Error?e.message:'Status produk belum dapat diperbarui.'},{status:400}); } }
export async function POST(request:Request,ctx:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); const form=await request.formData(); const patch=JSON.parse(String(form.get('patch')??'{}')); const {productId}=await ctx.params; await updateProductStatus(productId,productStatusSchema.parse(patch)); revalidatePath('/'); revalidatePath('/admin/products'); redirect('/admin/products'); }
