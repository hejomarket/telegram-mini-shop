import { AppShell } from '../components/AppShell';
import { listPublicProducts } from '../lib/products/repository';
import { listVisiblePublicBanners } from '../lib/merchandising/repository';

export default async function Home() {
  const [products, bannerResult] = await Promise.all([
    listPublicProducts(),
    listVisiblePublicBanners().catch((error) => {
      console.warn('storefront.banner.load.failed', { message: error instanceof Error ? error.message : 'Unknown error' });
      return { rows: [] };
    }),
  ]);

  return <AppShell products={products} banners={bannerResult.rows} />;
}
