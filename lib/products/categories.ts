export type ProductCategoryNavigationItem = { label: string; value: string };
export const CATEGORY_QUERY_MAX_LENGTH = 100;

export function normalizeCategoryLabel(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const label = value.trim().replace(/\s+/g, ' ');
  if (!label || /[\u0000-\u001f\u007f]/.test(label)) return null;
  return label.slice(0, CATEGORY_QUERY_MAX_LENGTH);
}

export function normalizeCategoryValue(value: string | null | undefined): string | null {
  const label = normalizeCategoryLabel(value);
  if (!label) return null;
  const normalized = label.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  return normalized && normalized.length <= CATEGORY_QUERY_MAX_LENGTH ? normalized : null;
}

export function parseCategoryQuery(value: string | string[] | null | undefined): string | null {
  if (Array.isArray(value)) return null;
  if (typeof value !== 'string' || value.length > CATEGORY_QUERY_MAX_LENGTH || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return normalizeCategoryValue(value);
}

export function derivePublicCategories(products: { category: string | null }[]): ProductCategoryNavigationItem[] {
  const byValue = new Map<string, string>();
  for (const product of products) {
    const label = normalizeCategoryLabel(product.category);
    const value = normalizeCategoryValue(product.category);
    if (!label || !value) continue;
    const existing = byValue.get(value);
    if (!existing || (existing === existing.toLowerCase() && label !== label.toLowerCase())) byValue.set(value, label);
  }
  return [...byValue.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'id', { sensitivity: 'base' }) || a.value.localeCompare(b.value));
}

export function getCategoryHref(value: string | null): string {
  return value ? `/?category=${encodeURIComponent(value)}#products` : '/#products';
}
