import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useGetAllProducts, useGetCallerCustomStickers } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CartItem from '../components/CartItem';
import { formatCurrency } from '../utils/formatCurrency';

export default function Cart() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: customStickers } = useGetCallerCustomStickers();

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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-black mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to view your shopping cart.
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            Add some products to your cart to get started!
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
          <ShoppingCart className="h-10 w-10" />
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem key={item.productId.toString()} item={item} />
            ))}
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
                  onClick={() => navigate({ to: '/checkout' })}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
