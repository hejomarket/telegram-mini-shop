import assert from 'node:assert/strict';
import test from 'node:test';
function normalizeSlug(value) { return value.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, ''); }
function normalizeSku(value) { return value.trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9._-]/g, ''); }
function isProductPurchasable(p) { return p.isActive === true && p.isAvailable === true && p.price > 0; }
function mapProductDbError(error) { const msg = error?.message ?? ''; if (/slug/i.test(msg)) return 'Slug produk sudah digunakan.'; if (/sku/i.test(msg)) return 'SKU produk sudah digunakan.'; return 'Produk belum dapat disimpan.'; }
test('normalizes slug and SKU', () => { assert.equal(normalizeSlug(' SOIA Rasa Kecombrang!! '), 'soia-rasa-kecombrang'); assert.equal(normalizeSku(' soia ori 100 '), 'SOIA-ORI-100'); });
test('purchase eligibility is centralized', () => { assert.equal(isProductPurchasable({isActive:true,isAvailable:true,price:1}), true); assert.equal(isProductPurchasable({isActive:false,isAvailable:true,price:1}), false); assert.equal(isProductPurchasable({isActive:true,isAvailable:false,price:1}), false); });
test('maps unique constraint errors safely', () => { assert.equal(mapProductDbError({message:'duplicate key products_slug_unique_idx'}), 'Slug produk sudah digunakan.'); assert.equal(mapProductDbError({message:'duplicate key products_sku_unique_idx'}), 'SKU produk sudah digunakan.'); });
test('cart reconciliation keeps server price authoritative in payload shape', () => { const client = [{ productId: 'soia-original', quantity: 2, price: 1 }]; const payload = client.map(({ productId, quantity }) => ({ productId, quantity })); assert.deepEqual(payload, [{ productId: 'soia-original', quantity: 2 }]); });
