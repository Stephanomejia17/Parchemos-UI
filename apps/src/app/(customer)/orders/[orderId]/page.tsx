import { OrderTracking } from "@/modules/customer/order-tracking/OrderTracking";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderTracking orderId={orderId} />;
}
