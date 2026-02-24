import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Package, MapPin, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useGetAllProducts, useCheckout, useGetCallerCustomStickers } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { PaymentMethod } from '../backend';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatCurrency';

export default function Checkout() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: customStickers } = useGetCallerCustomStickers();
  const checkout = useCheckout();

  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.cash);

  const isLoading = cartLoading || productsLoading;

  // Calculate total by fetching prices from both products and custom stickers
  const calculateTotal = (): bigint => {
    if (!cart || cart.length === 0) return BigInt(0);
    
    let total = BigInt(0);
    
    for (const item of cart) {
      // Check if it's a regular product
      const product = products?.find((p) => p.id === item.productId);
      if (product) {
        total += product.price * item.quantity;
        continue;
      }
      
      // Check if it's a custom sticker
      const sticker = customStickers?.find((s) => s.id === item.productId);
      if (sticker) {
        total += sticker.price * item.quantity;
      }
    }
    
    return total;
  };

  const totalInPaise = calculateTotal();

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error('Name required', {
        description: 'Please enter your name.',
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Address required', {
        description: 'Please enter your delivery address.',
      });
      return;
    }

    try {
      const orderId = await checkout.mutateAsync({
        paymentMethod,
        deliveryAddress: deliveryAddress.trim(),
      });
      
      toast.success('Order placed successfully!', {
        description: `Your order #${orderId} has been confirmed.`,
      });
      
      navigate({ to: '/confirmation' });
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      
      // Check for authorization errors
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
        toast.error('Unable to complete checkout', {
          description: 'There was an authorization issue. Please try logging out and back in.',
        });
      } else {
        toast.error('Checkout failed', {
          description: errorMessage,
        });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <CreditCard className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-black mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to complete your checkout.
          </p>
          <Button onClick={() => login()} size="lg" className="font-bold">
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 bg-muted rounded w-48 mb-8 animate-pulse" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-black mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some products to your cart before checking out.
          </p>
          <Button onClick={() => navigate({ to: '/' })} size="lg" className="font-bold">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8 flex items-center gap-3">
          <CreditCard className="h-10 w-10" />
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === PaymentMethod.cash}
                      onChange={() => setPaymentMethod(PaymentMethod.cash)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      name="payment"
                      value="googlePay"
                      disabled
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Google Pay</div>
                      <div className="text-sm text-muted-foreground">Coming soon</div>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-semibold">{cart.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalInPaise)}</span>
                </div>
                <Button
                  className="w-full font-bold text-base h-12"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkout.isPending || !customerName.trim() || !deliveryAddress.trim()}
                >
                  {checkout.isPending ? 'Processing...' : 'Place Order'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
