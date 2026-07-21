import { AppShell } from '../components/AppShell';
import { products as demoProducts } from '../lib/products';
import { buildPublicMerchandisingCatalog, getPublicMerchandisingCatalog } from '../lib/products/repository';
import { listVisiblePublicBanners } from '../lib/merchandising/repository';

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [catalog, bannerResult] = await Promise.all([
    getPublicMerchandisingCatalog(sp.category).catch((error) => {
      console.warn('storefront.catalog.load.failed', { message: error instanceof Error ? error.message : 'Unknown error' });
      return buildPublicMerchandisingCatalog(demoProducts, sp.category);
    }),
    listVisiblePublicBanners().catch((error) => {
      console.warn('storefront.banner.load.failed', { message: error instanceof Error ? error.message : 'Unknown error' });
      return { rows: [] };
    }),
  ]);

  return <AppShell products={catalog.filteredProducts} allProducts={catalog.products} featuredProducts={catalog.featuredProducts} bestSellerProducts={catalog.bestSellerProducts} categories={catalog.categories} selectedCategory={catalog.selectedCategory} selectedCategoryValue={catalog.selectedCategoryValue} hasInvalidCategory={catalog.hasInvalidCategory} banners={bannerResult.rows} />;
}
