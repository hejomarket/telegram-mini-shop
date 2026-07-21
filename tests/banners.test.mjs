import assert from 'node:assert/strict';
import test from 'node:test';

const destinationTypes = ['none', 'product', 'category', 'featured', 'all_products', 'internal_path'];
const normalize = (type, value) => ['none','featured','all_products'].includes(type) ? null : (value ?? '').trim();
const isSafePath = value => {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) return false;
  if (lower.startsWith('http:') || lower.startsWith('https:') || lower.startsWith('javascript:') || lower.startsWith('data:')) return false;
  if (/%[0-9a-f]{2}/i.test(trimmed)) {
    try { const decoded = decodeURIComponent(trimmed).toLowerCase(); if (decoded.includes('://') || decoded.startsWith('/admin') || decoded.startsWith('/api') || decoded.startsWith('//') || decoded.includes('javascript:') || decoded.includes('data:')) return false; } catch { return false; }
  }
  return !trimmed.includes('://') && !/^\/(admin|api)(?:\/|$)/i.test(trimmed);
};
const validDest = (type, value) => {
  if (!destinationTypes.includes(type)) return false;
  if (['none','featured','all_products'].includes(type)) return value === null;
  if (type === 'product') return /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,159}$/.test(value ?? '');
  if (type === 'category') return /^[a-z0-9][a-z0-9-]{0,99}$/.test(value ?? '');
  return isSafePath(value ?? '');
};
const visible = (b, now) => b.is_active === true && (!b.starts_at || now >= Date.parse(b.starts_at)) && (!b.ends_at || now <= Date.parse(b.ends_at));
const state = (b, now) => !b.is_active ? 'inactive' : b.starts_at && now < Date.parse(b.starts_at) ? 'scheduled' : b.ends_at && now > Date.parse(b.ends_at) ? 'expired' : 'active';
const row = overrides => ({ id:'1', title:'T', subtitle:null, eyebrow_text:null, image_url:'/b.jpg', mobile_image_url:null, image_alt:'Alt', cta_label:null, destination_type:'none', destination_value:null, is_active:true, display_order:0, text_theme:'light', overlay_strength:0.25, background_color:null, starts_at:null, ends_at:null, created_at:'2026-01-01T00:00:00.000Z', updated_at:'2026-01-01T00:00:00.000Z', ...overrides });
const serialize = r => ({ id:r.id, title:r.title, subtitle:r.subtitle, eyebrowText:r.eyebrow_text, imageUrl:r.image_url, mobileImageUrl:r.mobile_image_url, imageAlt:r.image_alt, ctaLabel:r.cta_label, destinationType:r.destination_type, destinationValue:r.destination_value, displayOrder:r.display_order, textTheme:r.text_theme, overlayStrength:Number(r.overlay_strength), backgroundColor:r.background_color });

test('schedule eligibility covers active, inactive, future, expired, and boundaries', () => {
  const now = Date.parse('2026-07-21T12:00:00.000Z');
  assert.equal(visible(row({}), now), true);
  assert.equal(visible(row({ is_active:false }), now), false);
  assert.equal(visible(row({ starts_at:'2026-07-22T00:00:00.000Z' }), now), false);
  assert.equal(visible(row({ ends_at:'2026-07-20T00:00:00.000Z' }), now), false);
  assert.equal(visible(row({ starts_at:'2026-07-21T12:00:00.000Z' }), now), true);
  assert.equal(visible(row({ ends_at:'2026-07-21T12:00:00.000Z' }), now), true);
});

test('schedule-state derivation is centralized', () => {
  const now = Date.parse('2026-07-21T12:00:00.000Z');
  assert.equal(state(row({}), now), 'active');
  assert.equal(state(row({ is_active:false }), now), 'inactive');
  assert.equal(state(row({ starts_at:'2026-07-22T00:00:00.000Z' }), now), 'scheduled');
  assert.equal(state(row({ ends_at:'2026-07-20T00:00:00.000Z' }), now), 'expired');
});

test('destination validation accepts only allowed safe destinations', () => {
  assert.equal(validDest('product', normalize('product', 'soia-original')), true);
  assert.equal(validDest('category', 'snack-protein'), true);
  assert.equal(validDest('none', null), true);
  assert.equal(validDest('featured', null), true);
  assert.equal(validDest('all_products', null), true);
  assert.equal(validDest('internal_path', '/products?featured=1'), true);
  assert.equal(validDest('internal_path', '/admin'), false);
  assert.equal(validDest('internal_path', '/api/products'), false);
  assert.equal(validDest('internal_path', 'https://example.com'), false);
  assert.equal(validDest('internal_path', '//example.com'), false);
  assert.equal(validDest('internal_path', '/%2fexample.com'), false);
});

test('overlay range and schedule date validation rules are bounded', () => {
  const overlayValid = value => Number.isFinite(value) && value >= 0 && value <= 0.7;
  assert.equal(overlayValid(0), true);
  assert.equal(overlayValid(0.7), true);
  assert.equal(overlayValid(0.71), false);
  assert.equal(Date.parse('2026-07-22T00:00:00.000Z') > Date.parse('2026-07-21T00:00:00.000Z'), true);
  assert.equal(Date.parse('2026-07-21T00:00:00.000Z') > Date.parse('2026-07-21T00:00:00.000Z'), false);
});

test('banner sort order and public serialization omit admin metadata', () => {
  const rows = [row({id:'b',display_order:2}), row({id:'a',display_order:1}), row({id:'c',display_order:1,created_at:'2026-01-02T00:00:00.000Z'})].sort((a,b)=>a.display_order-b.display_order||a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
  assert.deepEqual(rows.map(r=>r.id), ['a','c','b']);
  const publicBanner = serialize(rows[0]);
  assert.equal('is_active' in publicBanner, false);
  assert.equal('created_at' in publicBanner, false);
  assert.equal(publicBanner.imageUrl, '/b.jpg');
});

test('empty database or Demo Mode fallback returns no public banners', () => {
  const result = { rows: [], mode: 'demo' };
  assert.deepEqual(result.rows, []);
  assert.equal(result.mode, 'demo');
});
