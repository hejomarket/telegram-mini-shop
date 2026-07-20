import type { OrderStatus, PaymentStatus } from './types';
export const CUSTOMER_ORDERS_STORAGE_KEY = 'soia.customerOrders';
export const MAX_CUSTOMER_ORDERS = 20;
export type CustomerOrderHistoryItem = { orderNumber: string; accessToken: string; createdAt: string; customerName?: string; orderStatus?: OrderStatus; paymentStatus?: PaymentStatus; grandTotal?: number };
const orderRe=/^SOIA-\d{8}-[A-Z0-9]{6}$/;
const os=new Set(['pending','confirmed','processing','shipped','completed','cancelled']);
const ps=new Set(['unpaid','pending','paid','failed','expired','cancelled','challenged','refunded']);
function valid(v: unknown): CustomerOrderHistoryItem | null { if(!v || typeof v !== 'object') return null; const r=v as Record<string,unknown>; if(typeof r.orderNumber !== 'string' || !orderRe.test(r.orderNumber) || typeof r.accessToken !== 'string' || r.accessToken.length < 20 || typeof r.createdAt !== 'string') return null; return { orderNumber:r.orderNumber, accessToken:r.accessToken, createdAt:r.createdAt, customerName: typeof r.customerName==='string'?r.customerName:undefined, orderStatus: os.has(String(r.orderStatus))?r.orderStatus as OrderStatus:undefined, paymentStatus: ps.has(String(r.paymentStatus))?r.paymentStatus as PaymentStatus:undefined, grandTotal: typeof r.grandTotal==='number'&&Number.isFinite(r.grandTotal)?r.grandTotal:undefined }; }
export function parseCustomerOrderHistory(raw: string | null) { try { const parsed = raw ? JSON.parse(raw) : []; if(!Array.isArray(parsed)) return []; const map=new Map<string,CustomerOrderHistoryItem>(); for(const item of parsed){ const v=valid(item); if(v) map.set(v.orderNumber,v); } return [...map.values()].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,MAX_CUSTOMER_ORDERS); } catch { return []; } }
export function upsertCustomerOrderHistory(items: CustomerOrderHistoryItem[], item: CustomerOrderHistoryItem) { const clean=parseCustomerOrderHistory(JSON.stringify([item,...items])); return clean; }
export function readCustomerOrderHistory() { if(typeof window==='undefined') return []; return parseCustomerOrderHistory(window.localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY)); }
export function writeCustomerOrderHistory(items: CustomerOrderHistoryItem[]) { if(typeof window==='undefined') return; window.localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(parseCustomerOrderHistory(JSON.stringify(items)))); }
export function removeCustomerOrder(orderNumber: string) { const items=readCustomerOrderHistory().filter(i=>i.orderNumber!==orderNumber); writeCustomerOrderHistory(items); }
