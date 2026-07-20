export type ProductStatus = 'active' | 'inactive';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  protein: string;
  status: ProductStatus;
  badge: string;
  accent: string;
};

export const products: Product[] = [
  {
    id: 'soia-original',
    name: 'SOIA Original',
    description: 'Light and savory plant-based protein snack for everyday snacking.',
    price: 25000,
    weight: '100 g',
    protein: '18 g',
    status: 'active',
    badge: 'Best Seller',
    accent: '#d8ae57',
  },
  {
    id: 'soia-seaweed',
    name: 'SOIA Seaweed',
    description: 'Balanced seaweed flavor with a savory umami profile.',
    price: 28000,
    weight: '100 g',
    protein: '18 g',
    status: 'active',
    badge: 'Umami',
    accent: '#4e8f6d',
  },
  {
    id: 'soia-kecombrang',
    name: 'SOIA Kecombrang',
    description: 'A bold and aromatic Indonesian kecombrang flavor.',
    price: 30000,
    weight: '100 g',
    protein: '18 g',
    status: 'active',
    badge: 'Signature',
    accent: '#c45f48',
  },
];

export const productById = new Map(products.map((product) => [product.id, product]));
