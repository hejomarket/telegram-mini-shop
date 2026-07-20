import { NextResponse } from 'next/server';
import { requireAdminApi } from '../../../../../../lib/admin/auth';
import { isOrderStatus } from '../../../../../../lib/admin/status';
import { updateOrderStatus, getAdminOrder } from '../../../../../../lib/admin/orders';
import { createOrderEvent } from '../../../../../../lib/orders/events';
type Params={params:Promise<{orderNumber:string}>};
export async function PATCH(request: Request,{params}:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{const {orderNumber}=await params; const {status}=await request.json(); if(!isOrderStatus(status)) return NextResponse.json({message:'Status pesanan tidak valid.'},{status:400}); const before=await getAdminOrder(orderNumber); const updated=await updateOrderStatus(orderNumber,status); if(updated && before?.id && before.status !== status) await createOrderEvent({ orderId: before.id, eventType: `order_${status}`, orderStatus: status, paymentStatus: before.paymentStatus, title: 'Status Pesanan Diperbarui', description: 'Status pesanan diperbarui oleh admin.', source: 'admin' }); if(!updated) return NextResponse.json({message:'Pesanan tidak ditemukan.'},{status:404}); return NextResponse.json({success:true,order:updated});}catch{return NextResponse.json({message:'Gagal memperbarui status.'},{status:500});}}
