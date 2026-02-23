import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, CreditCard, User } from 'lucide-react';
import { useGetAllOrders, useIsCallerAdmin, useGetProduct, useGetCustomSticker } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Order, OrderStatus, PaymentMethod } from '../backend';
import { useEffect } from 'react';

function OrderItemDisplay({ productId }: { productId: bigint }) {
  const { data: product } = useGetProduct(productId);
  const { data: customSticker } = useGetCustomSticker(productId);

  if (customSticker) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded overflow-hidden bg-muted/30 flex-shrink-0">
          <img
            src={customSticker.image.getDirectURL()}
            alt={customSticker.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{customSticker.name}</p>
          <p className="text-xs text-primary">Custom Sticker</p>
        </div>
      </div>
    );
  }

  if (product) {
    return (
      <div className="flex-1">
        <p className="font-semibold">{product.name}</p>
      </div>
    );
  }

  return (
    <span className="text-muted-foreground">
      Product ID: {productId.toString()}
    </span>
  );
}

export default function AdminOrders() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsCallerAdmin();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();

  const isAuthenticated = !!identity;
  const isCheckingAuth = isInitializing || isAdminLoading;

  // Debug logging
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log('=== AdminOrders Debug Info ===', timestamp);
    console.log('isInitializing:', isInitializing);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('identity:', identity ? identity.getPrincipal().toString() : 'null');
    console.log('isAdminLoading:', isAdminLoading);
    console.log('isAdminFetched:', isAdminFetched);
    console.log('isAdmin:', isAdmin);
    console.log('isCheckingAuth:', isCheckingAuth);
    console.log('ordersLoading:', ordersLoading);
    console.log('orders count:', orders?.length || 0);
    console.log('==============================');
  }, [isInitializing, isAuthenticated, identity, isAdminLoading, isAdminFetched, isAdmin, isCheckingAuth, ordersLoading, orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>;
      case OrderStatus.completed:
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Completed</Badge>;
      case OrderStatus.cancelled:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.cash:
        return 'Cash on Delivery';
      case PaymentMethod.googlePay:
        return 'Google Pay';
      default:
        return 'Unknown';
    }
  };

  // Show loading state while checking authentication and admin status
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black mb-8">All Orders</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin (after auth check is complete)
  if (!isAuthenticated || (isAdminFetched && !isAdmin)) {
    return <AccessDeniedScreen />;
  }

  // Sort orders by newest first (assuming higher order IDs are newer)
  const sortedOrders = orders ? [...orders].reverse() : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">All Orders</h1>
          <p className="text-muted-foreground">
            View and manage customer orders
          </p>
        </div>

        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedOrders && sortedOrders.length > 0 ? (
          <div className="space-y-6">
            {sortedOrders.map((order, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {order.customerName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Order #{index + 1}
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold mb-1">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold mb-1">Payment Method</p>
                        <p className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <p className="font-semibold">Order Items</p>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center text-sm bg-muted/30 p-3 rounded-lg">
                          <OrderItemDisplay productId={item.productId} />
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              Qty: <span className="font-semibold text-foreground">{Number(item.quantity)}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-2xl font-black text-primary">
                      ₹{(Number(order.total) / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Orders will appear here once customers make purchases
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
