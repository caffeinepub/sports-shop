import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function OrderConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            Order Confirmed!
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your purchase! Your order has been successfully placed.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              We'll prepare your items for delivery. You should receive your sports equipment soon!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/' })}
              className="font-bold"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
