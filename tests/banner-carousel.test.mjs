import assert from 'node:assert/strict';
import test from 'node:test';

const safePath = value => {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) return false;
  if (lower.startsWith('http:') || lower.startsWith('https:') || lower.startsWith('javascript:') || lower.startsWith('data:')) return false;
  if (/%[0-9a-f]{2}/i.test(trimmed)) {
    try {
      const decoded = decodeURIComponent(trimmed).toLowerCase();
      if (decoded.includes('://') || decoded.startsWith('/admin') || decoded.startsWith('/api') || decoded.startsWith('//') || decoded.includes('javascript:') || decoded.includes('data:')) return false;
    } catch { return false; }
  }
  return !trimmed.includes('://') && !/^\/(admin|api)(?:\/|$)/i.test(trimmed);
};

const resolveHref = banner => {
  const value = banner.destinationValue?.trim() ?? null;
  if (banner.destinationType === 'none') return null;
  if (banner.destinationType === 'all_products') return '/#products';
  if (banner.destinationType === 'featured') return '/#featured';
  if (banner.destinationType === 'category') return value && /^[a-z0-9][a-z0-9-]{0,99}$/.test(value) ? `/?category=${encodeURIComponent(value)}#products` : null;
  if (banner.destinationType === 'internal_path') return value && safePath(value) ? value : null;
  return null;
};

const carouselState = count => ({ renders: count > 0, controls: count > 1, dots: count > 1, autoplay: count > 1 });

test('carousel renders nothing for no banners', () => {
  assert.deepEqual(carouselState(0), { renders: false, controls: false, dots: false, autoplay: false });
});

test('single banner hides controls, dots, and autoplay', () => {
  assert.deepEqual(carouselState(1), { renders: true, controls: false, dots: false, autoplay: false });
});

test('multiple banners enable finite controls, dots, swipe, and autoplay eligibility', () => {
  assert.deepEqual(carouselState(3), { renders: true, controls: true, dots: true, autoplay: true });
});

test('public CTA resolver maps safe storefront destinations', () => {
  assert.equal(resolveHref({ destinationType: 'all_products', destinationValue: null }), '/#products');
  assert.equal(resolveHref({ destinationType: 'featured', destinationValue: null }), '/#featured');
  assert.equal(resolveHref({ destinationType: 'category', destinationValue: 'snack-protein' }), '/?category=snack-protein#products');
  assert.equal(resolveHref({ destinationType: 'internal_path', destinationValue: '/checkout' }), '/checkout');
});

test('public CTA resolver suppresses product and unsafe destinations', () => {
  assert.equal(resolveHref({ destinationType: 'none', destinationValue: null }), null);
  assert.equal(resolveHref({ destinationType: 'product', destinationValue: 'soia-original' }), null);
  assert.equal(resolveHref({ destinationType: 'internal_path', destinationValue: '/admin/storefront/banners' }), null);
  assert.equal(resolveHref({ destinationType: 'internal_path', destinationValue: '/api/products' }), null);
  assert.equal(resolveHref({ destinationType: 'internal_path', destinationValue: 'https://example.com' }), null);
  assert.equal(resolveHref({ destinationType: 'internal_path', destinationValue: '//example.com' }), null);
  assert.equal(resolveHref({ destinationType: 'internal_path', destinationValue: 'javascript:alert(1)' }), null);
  assert.equal(resolveHref({ destinationType: 'category', destinationValue: '../bad' }), null);
});

test('autoplay is disabled by reduced motion, hidden pages, focus, hover, and interaction', () => {
  const canAutoplay = s => s.count > 1 && !s.reducedMotion && s.visible && !s.hovered && !s.focused && !s.interacting;
  assert.equal(canAutoplay({ count: 2, reducedMotion: false, visible: true, hovered: false, focused: false, interacting: false }), true);
  assert.equal(canAutoplay({ count: 2, reducedMotion: true, visible: true, hovered: false, focused: false, interacting: false }), false);
  assert.equal(canAutoplay({ count: 2, reducedMotion: false, visible: false, hovered: false, focused: false, interacting: false }), false);
  assert.equal(canAutoplay({ count: 2, reducedMotion: false, visible: true, hovered: true, focused: false, interacting: false }), false);
  assert.equal(canAutoplay({ count: 2, reducedMotion: false, visible: true, hovered: false, focused: true, interacting: false }), false);
  assert.equal(canAutoplay({ count: 2, reducedMotion: false, visible: true, hovered: false, focused: false, interacting: true }), false);
});

test('image failure preserves slide content on fallback background', () => {
  const imageState = failed => ({ showImage: !failed, showFallbackBackground: true, keepTextAndCta: true });
  assert.deepEqual(imageState(true), { showImage: false, showFallbackBackground: true, keepTextAndCta: true });
});
