import { NextResponse } from 'next/server';
import { requireAdminApi } from '../../../../../../lib/admin/auth';
import { updateAdminNotes } from '../../../../../../lib/admin/orders';
type Params={params:Promise<{orderNumber:string}>};
export async function PATCH(request: Request,{params}:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{const {orderNumber}=await params; const {adminNotes}=await request.json(); if(typeof adminNotes!=='string'||adminNotes.length>2000) return NextResponse.json({message:'Catatan maksimal 2.000 karakter.'},{status:400}); const updated=await updateAdminNotes(orderNumber,adminNotes); if(!updated) return NextResponse.json({message:'Pesanan tidak ditemukan.'},{status:404}); return NextResponse.json({success:true,order:updated});}catch{return NextResponse.json({message:'Gagal menyimpan catatan.'},{status:500});}}
