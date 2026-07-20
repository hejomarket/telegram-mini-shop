import { NextResponse } from 'next/server';
import { requireAdminApi } from '../../../../../../lib/admin/auth';
import { updateShippingInfo } from '../../../../../../lib/admin/orders';
export async function PATCH(request: Request,{params}:{params:Promise<{orderNumber:string}>}){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{ const {orderNumber}=await params; const body=await request.json(); const updated=await updateShippingInfo(orderNumber, body); if(!updated) return NextResponse.json({message:'Pesanan tidak ditemukan.'},{status:404}); return NextResponse.json({success:true,order:updated}); } catch(e){ return NextResponse.json({message:e instanceof Error?e.message:'Gagal menyimpan pengiriman.'},{status:400}); } }
