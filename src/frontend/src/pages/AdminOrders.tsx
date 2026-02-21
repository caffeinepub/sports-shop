import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, Package, MapPin, CreditCard } from 'lucide-react';
import { useGetAllOrders, useIsCallerAdmin, useGetAllProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Order, OrderStatus, PaymentMethod } from '../backend';

export default function AdminOrders() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();
  const { data: products } = useGetAllProducts();

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || isAdminLoading || ordersLoading;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.pending:
        return <Badge variant="secondary">Pending</Badge>;
      case OrderStatus.completed:
        return <Badge className="bg-green-600">Completed</Badge>;
      case OrderStatus.cancelled:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.cash:
        return 'Cash on Delivery';
      case PaymentMethod.googlePay:
        return 'Google Pay';
      default:
        return 'Unknown';
    }
  };

  const getProductName = (productId: bigint): string => {
    const product = products?.find(p => p.id === productId);
    return product?.name || `Product #${productId}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-8">Orders</h1>
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

  if (!isAuthenticated || !isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Orders</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Overview
            </CardTitle>
            <CardDescription>
              {orders?.length || 0} order{orders?.length !== 1 ? 's' : ''} received
            </CardDescription>
          </CardHeader>
        </Card>

        {ordersLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </CardContent>
          </Card>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        Order #{index + 1}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="font-semibold">{order.customerName}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{order.user.toString().slice(0, 10)}...</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-start gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Delivery Address</p>
                          <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Payment Method</p>
                          <p className="text-sm text-muted-foreground">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start gap-2">
                        <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold mb-2">Order Items</p>
                          <div className="space-y-2">
                            {order.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {getProductName(item.productId)} × {Number(item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-black text-primary">
                        ₹{Number(order.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
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
