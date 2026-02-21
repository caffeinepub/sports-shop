import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Banknote, MapPin } from 'lucide-react';
import { useGetCart, useGetAllProducts, useCompleteCheckout } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { PaymentMethod } from '../backend';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const completeCheckout = useCompleteCheckout();

  const isLoading = cartLoading || productsLoading;

  const cartWithProducts = cart?.map((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const total = cartWithProducts?.reduce((sum, item) => {
    return sum + Number(item.product.price) * Number(item.quantity);
  }, 0) || 0;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first', {
        description: 'You need to be logged in to complete checkout.',
        action: {
          label: 'Login',
          onClick: () => login(),
        },
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Delivery address required', {
        description: 'Please enter your delivery address.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const paymentMethodEnum = paymentMethod === 'cash' ? PaymentMethod.cash : PaymentMethod.googlePay;
      const orderId = await completeCheckout.mutateAsync({
        paymentMethod: paymentMethodEnum,
        deliveryAddress: deliveryAddress.trim(),
      });
      toast.success('Order placed successfully!');
      navigate({ to: '/confirmation' });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to complete checkout', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-black mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to proceed with checkout.
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black mb-8">Checkout</h1>
          <Card className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-black mb-4">No items to checkout</h1>
          <p className="text-muted-foreground mb-8">
            Add some products to your cart first!
          </p>
          <Button asChild size="lg" className="font-bold">
            <a href="/">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Checkout</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-black">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartWithProducts?.map((item) => (
                <div key={item.productId.toString()} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {Number(item.quantity)}
                    </p>
                  </div>
                  <p className="font-bold">₹{Number(item.product.price) * Number(item.quantity)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black text-primary">₹{total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete delivery address including street, city, state, and PIN code"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Please provide a complete address for accurate delivery
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-black">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="googlePay" id="googlePay" disabled />
                  <Label
                    htmlFor="googlePay"
                    className="flex-1 flex items-center gap-3 cursor-not-allowed opacity-50"
                  >
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Google Pay</p>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label
                    htmlFor="cash"
                    className="flex-1 flex items-center gap-3 cursor-pointer"
                  >
                    <Banknote className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button
            className="w-full font-bold text-base h-12"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing || !deliveryAddress.trim()}
          >
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
