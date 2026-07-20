import { z } from 'zod';

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable().transform((value) => value || null);

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: text(3, 120),
    whatsapp: z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/).max(24),
    email: z.string().trim().email().max(254).optional().or(z.literal('')).transform((value) => value || null),
  }),
  address: z.object({
    address: text(10, 500),
    district: text(3, 120),
    city: text(3, 120),
    province: text(3, 120),
    postalCode: z.string().trim().regex(/^\d{5}$/),
    notes: optionalText(500),
  }),
  items: z.array(z.object({
    productId: text(1, 80),
    quantity: z.number().int().positive().max(99),
  })).min(1).max(50),
  telegram: z.object({
    userId: z.number().int().positive().safe().optional().nullable(),
    username: optionalText(64),
    firstName: optionalText(128),
    lastName: optionalText(128),
    language: optionalText(16),
  }).optional().default({}),
}).strict();

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
