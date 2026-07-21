import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '../../../../../lib/admin/auth';
import { BannerRepositoryError, createBanner } from '../../../../../lib/merchandising/repository';
function revalidate(){ revalidatePath('/'); revalidatePath('/admin/storefront'); revalidatePath('/admin/storefront/banners'); }
export async function POST(request:Request){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{ const banner=await createBanner(await request.json()); revalidate(); return NextResponse.json({success:true,banner},{status:201}); }catch(e){ const status=e instanceof BannerRepositoryError?e.status:400; return NextResponse.json({message:e instanceof Error?e.message:'Banner belum dapat dibuat.'},{status}); } }
