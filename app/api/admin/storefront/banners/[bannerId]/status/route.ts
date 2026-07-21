import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '../../../../../../../lib/admin/auth';
import { activateBanner, BannerRepositoryError, deactivateBanner } from '../../../../../../../lib/merchandising/repository';
function revalidate(){ revalidatePath('/'); revalidatePath('/admin/storefront'); revalidatePath('/admin/storefront/banners'); }
type Params={params:Promise<{bannerId:string}>};
export async function POST(request:Request,{params}:Params){ if(!(await requireAdminApi())) return NextResponse.json({message:'Unauthorized'},{status:401}); try{ const {bannerId}=await params; const form=await request.formData(); const active=form.get('active') === 'true'; const banner=active?await activateBanner(bannerId):await deactivateBanner(bannerId); if(!banner) return NextResponse.json({message:'Banner tidak ditemukan.'},{status:404}); revalidate(); return NextResponse.redirect(new URL('/admin/storefront/banners', request.url)); }catch(e){ const status=e instanceof BannerRepositoryError?e.status:400; return NextResponse.json({message:e instanceof Error?e.message:'Status banner belum dapat diperbarui.'},{status}); } }
