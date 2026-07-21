'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicBanner } from '../lib/merchandising/types';
import { StorefrontBannerSlide } from './StorefrontBannerSlide';

const AUTOPLAY_MS = 6000;

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reducedMotion;
}

export function StorefrontBannerCarousel({ banners }: { banners: PublicBanner[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const interactionTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const hasMultiple = banners.length > 1;

  const goTo = useCallback((index: number, behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth') => {
    const viewport = viewportRef.current;
    if (!viewport || banners.length === 0) return;
    const nextIndex = (index + banners.length) % banners.length;
    const slide = viewport.children.item(nextIndex) as HTMLElement | null;
    slide?.scrollIntoView({ behavior, block: 'nearest', inline: 'start' });
    setActiveIndex(nextIndex);
  }, [banners.length, reducedMotion]);

  const markInteraction = useCallback(() => {
    setIsInteracting(true);
    if (interactionTimerRef.current) window.clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = window.setTimeout(() => setIsInteracting(false), AUTOPLAY_MS);
  }, []);

  useEffect(() => () => {
    if (interactionTimerRef.current) window.clearTimeout(interactionTimerRef.current);
  }, []);

  useEffect(() => {
    const handleVisibility = () => setIsPageVisible(document.visibilityState === 'visible');
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !hasMultiple) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset.bannerIndex);
      if (Number.isInteger(index)) setActiveIndex(index);
    }, { root: viewport, threshold: [0.55, 0.75] });
    Array.from(viewport.children).forEach((child) => observer.observe(child as Element));
    return () => observer.disconnect();
  }, [hasMultiple, banners.length]);

  useEffect(() => {
    if (!hasMultiple || reducedMotion || !isPageVisible || isHovered || hasFocusInside || isInteracting) return;
    const timer = window.setInterval(() => goTo(activeIndex + 1, 'smooth'), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [activeIndex, goTo, hasFocusInside, hasMultiple, isHovered, isInteracting, isPageVisible, reducedMotion]);

  if (banners.length === 0) return null;

  return (
    <section className="my-5" aria-label="Promosi SOIA">
      <div className="relative" onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => setIsHovered(false)} onFocusCapture={() => setHasFocusInside(true)} onBlurCapture={(event) => setHasFocusInside(event.currentTarget.contains(event.relatedTarget as Node) || false)}>
        <div
          ref={viewportRef}
          className="storefront-banner-scroll flex overflow-x-auto scroll-smooth rounded-[2.3rem] [scroll-snap-type:x_mandatory] motion-reduce:scroll-auto"
          tabIndex={hasMultiple ? 0 : -1}
          onScroll={markInteraction}
          onPointerDown={markInteraction}
          onKeyDown={(event) => {
            if (!hasMultiple) return;
            if (event.key === 'ArrowLeft') { event.preventDefault(); markInteraction(); goTo(activeIndex - 1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); markInteraction(); goTo(activeIndex + 1); }
          }}
        >
          {banners.map((banner, index) => <div key={banner.id} data-banner-index={index} className="min-w-full"><StorefrontBannerSlide banner={banner} index={index} total={banners.length} priority={index === 0} /></div>)}
        </div>
        {hasMultiple ? (
          <>
            <button type="button" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full bg-white/86 text-2xl font-black text-soia-green shadow-soft backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soia-lime md:grid md:place-items-center" aria-label="Banner sebelumnya" onClick={() => { markInteraction(); goTo(activeIndex - 1); }}>‹</button>
            <button type="button" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full bg-white/86 text-2xl font-black text-soia-green shadow-soft backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soia-lime md:grid md:place-items-center" aria-label="Banner berikutnya" onClick={() => { markInteraction(); goTo(activeIndex + 1); }}>›</button>
          </>
        ) : null}
      </div>
      {hasMultiple ? (
        <div className="mt-3 flex justify-center gap-2" aria-label="Navigasi banner">
          {banners.map((banner, index) => <button key={banner.id} type="button" className={`h-4 min-w-4 rounded-full border border-soia-green/25 transition ${activeIndex === index ? 'w-7 bg-soia-green' : 'bg-soia-green/18'}`} aria-label={`Tampilkan banner ${index + 1} dari ${banners.length}`} aria-current={activeIndex === index ? 'true' : undefined} onClick={() => { markInteraction(); goTo(index); }} />)}
        </div>
      ) : null}
    </section>
  );
}
