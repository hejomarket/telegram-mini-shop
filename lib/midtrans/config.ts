import 'server-only';
import type { MidtransConfig } from './types';

export function parseMidtransIsProduction(value?: string) { return value === 'true'; }
export function getMidtransConfig(): MidtransConfig {
  const isProduction = parseMidtransIsProduction(process.env.MIDTRANS_IS_PRODUCTION);
  const environment = isProduction ? 'production' : 'sandbox';
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim();
  const merchantId = process.env.MIDTRANS_MERCHANT_ID?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return { isConfigured: Boolean(serverKey && clientKey), isProduction, environment, serverKey, clientKey, merchantId, appUrl, snapApiBaseUrl: isProduction ? 'https://app.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1', snapJsUrl: isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js' };
}
export function getPublicMidtransConfig() { const c = getMidtransConfig(); return { isConfigured: c.isConfigured, isProduction: c.isProduction, clientKey: c.clientKey ?? null, snapJsUrl: c.snapJsUrl }; }
