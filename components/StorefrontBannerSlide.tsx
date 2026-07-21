'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PublicBanner } from '../lib/merchandising/types';
import { resolvePublicBannerHref } from '../lib/merchandising/public-destination';

export function StorefrontBannerSlide({ banner, index, total, priority = false }: { banner: PublicBanner; index: number; total: number; priority?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const href = banner.ctaLabel ? resolvePublicBannerHref(banner) : null;
  const textTone = banner.textTheme === 'dark' ? 'text-soia-green' : 'text-white';
  const mutedTone = banner.textTheme === 'dark' ? 'text-soia-green/70' : 'text-white/78';
  const fallbackBackground = banner.backgroundColor ?? '#123b2a';
  const hasText = Boolean(banner.eyebrowText || banner.title || banner.subtitle || href);

  return (
    <article
      className={`storefront-banner-slide relative flex min-w-full snap-center overflow-hidden rounded-[2.3rem] border border-soia-green/8 shadow-card ${textTone}`}
      aria-label={`Banner ${index + 1} dari ${total}`}
      style={{ backgroundColor: fallbackBackground }}
    >
      {!imageFailed ? (
        <picture className="absolute inset-0 block h-full w-full">
          {banner.mobileImageUrl ? <source media="(max-width: 640px)" srcSet={banner.mobileImageUrl} /> : null}
          <img
            src={banner.imageUrl}
            alt={banner.imageAlt}
            className="h-full w-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setImageFailed(true)}
          />
        </picture>
      ) : null}
      <span className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${Math.min(Math.max(banner.overlayStrength, 0), 0.7)})` }} aria-hidden="true" />
      {hasText ? (
        <div className="relative z-10 flex min-h-full max-w-xl flex-col justify-end p-6 md:p-8">
          {banner.eyebrowText ? <p className={`text-xs font-black uppercase tracking-[0.16em] ${mutedTone}`}>{banner.eyebrowText}</p> : null}
          {banner.title ? <h2 className="mt-2 text-3xl font-black leading-[0.98] tracking-[-0.055em] md:text-5xl">{banner.title}</h2> : null}
          {banner.subtitle ? <p className={`mt-3 max-w-md text-sm font-semibold leading-6 md:text-base ${mutedTone}`}>{banner.subtitle}</p> : null}
          {href ? (
            <Link href={href} className="mt-5 inline-flex min-h-12 w-fit items-center rounded-2xl bg-soia-lime px-5 text-sm font-black text-soia-forest shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soia-lime">
              {banner.ctaLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
