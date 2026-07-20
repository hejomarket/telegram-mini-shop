import { NextResponse } from 'next/server';
import { requireAdminApi } from '../../../../../../lib/admin/auth';
import { isOrderStatus } from '../../../../../../lib/admin/status';
import { updateOrderStatus } from '../../../../../../lib/admin/orders';
type Params={params:Promise<{orderNumber:string}>};
export async function PATCH(request: Request,{params}:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{const {orderNumber}=await params; const {status}=await request.json(); if(!isOrderStatus(status)) return NextResponse.json({message:'Status pesanan tidak valid.'},{status:400}); const updated=await updateOrderStatus(orderNumber,status); if(!updated) return NextResponse.json({message:'Pesanan tidak ditemukan.'},{status:404}); return NextResponse.json({success:true,order:updated});}catch{return NextResponse.json({message:'Gagal memperbarui status.'},{status:500});}}
