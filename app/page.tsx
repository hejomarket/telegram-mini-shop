import { AppShell } from '../components/AppShell';
import { listPublicProducts } from '../lib/products/repository';

export default async function Home() {
  const products = await listPublicProducts();
  return <AppShell products={products} />;
}
