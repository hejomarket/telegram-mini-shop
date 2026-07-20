import { OrderTrackingClient } from './OrderTrackingClient';
export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) { const { orderNumber } = await params; return <OrderTrackingClient orderNumber={orderNumber} />; }
