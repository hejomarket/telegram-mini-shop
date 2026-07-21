import { z } from 'zod';
import { bannerDestinationTypes, bannerTextThemes } from './types';
import { normalizeBannerDestinationValue, validateBannerDestination } from './destination';

const optionalText = (max: number) => z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? null : v), z.string().trim().max(max).nullable().optional());
const requiredAssetPath = z.string().trim().min(1).max(2000).refine(v => /^https?:\/\//i.test(v) || /^(?:\/|banners\/)[A-Za-z0-9._~!$&'()*+,;=:@/-]+$/.test(v), 'Use a managed URL or storage path.');
const optionalAssetPath = z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? null : v), requiredAssetPath.nullable().optional());
const optionalIsoDate = z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? null : v), z.string().datetime({ offset: true }).nullable().optional());
export const bannerIdSchema = z.string().trim().uuid();

export const bannerWriteSchema = z.object({
  title: optionalText(140),
  subtitle: optionalText(300),
  eyebrowText: optionalText(80),
  imageUrl: requiredAssetPath,
  mobileImageUrl: optionalAssetPath,
  imageAlt: z.string().trim().min(1).max(200),
  ctaLabel: optionalText(60),
  destinationType: z.enum(bannerDestinationTypes).default('none'),
  destinationValue: z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? null : v), z.string().trim().nullable().optional()),
  isActive: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().min(-100000).max(100000).default(0),
  textTheme: z.enum(bannerTextThemes).default('light'),
  overlayStrength: z.coerce.number().min(0).max(0.7).default(0.25),
  backgroundColor: z.preprocess(v => (typeof v === 'string' && v.trim() === '' ? null : v), z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).nullable().optional()),
  startsAt: optionalIsoDate,
  endsAt: optionalIsoDate,
  updatedAt: z.string().optional(),
}).transform(v => ({ ...v, destinationValue: normalizeBannerDestinationValue(v.destinationType, v.destinationValue) })).superRefine((v, ctx) => {
  if (!validateBannerDestination(v.destinationType, v.destinationValue ?? null)) ctx.addIssue({ code: 'custom', path: ['destinationValue'], message: 'Destination value is not valid for this banner destination type.' });
  if (v.startsAt && v.endsAt && Date.parse(v.endsAt) <= Date.parse(v.startsAt)) ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'End date must be later than start date.' });
});
