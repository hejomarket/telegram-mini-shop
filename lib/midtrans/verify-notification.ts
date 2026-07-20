import 'server-only';
import { createHash, timingSafeEqual } from 'crypto';
export function createMidtransSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string) { return createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex'); }
export function verifyMidtransSignature(payload: { order_id?: string; status_code?: string; gross_amount?: string; signature_key?: string }, serverKey: string) {
  if (!payload.order_id || !payload.status_code || !payload.gross_amount || !payload.signature_key) return false;
  const expected = Buffer.from(createMidtransSignature(payload.order_id, payload.status_code, payload.gross_amount, serverKey));
  const actual = Buffer.from(payload.signature_key);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function amountsMatch(providerGrossAmount: string | number, trustedAmount: number) { return Math.round(Number(providerGrossAmount)) === trustedAmount; }
