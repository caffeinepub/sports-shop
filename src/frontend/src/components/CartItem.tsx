import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductCategory, Product } from '../backend';
import { CartItem as CartItemType } from '../types';
import { useUpdateCartItem, useRemoveCartItem } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType & { product: Product };
}

const getProductImage = (product: Product): string => {
  // Check if this is the Vixen T.T Ball product
  if (product.name.toLowerCase().includes('vixen') && product.name.toLowerCase().includes('t.t')) {
    return '/assets/generated/vixen-tt-ball.dim_400x400.png';
  }
  
  // Fall back to category-based images
  switch (product.category) {
    case ProductCategory.tableTennisBalls:
      return '/assets/generated/table-tennis-ball.dim_400x400.png';
    case ProductCategory.badmintonShuttles:
      return '/assets/generated/badminton-shuttle.dim_400x400.png';
    default:
      return '/assets/generated/table-tennis-ball.dim_400x400.png';
  }
};

export default function CartItem({ item }: CartItemProps) {
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > Number(item.product.stock)) {
      toast.error('Not enough stock', {
        description: `Only ${item.product.stock} items available.`,
      });
      return;
    }

    try {
      await updateCartItem.mutateAsync({
        productId: item.productId,
        quantity: BigInt(newQuantity),
      });
    } catch (error) {
      toast.error('Failed to update quantity', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleRemove = async () => {
    try {
      await removeCartItem.mutateAsync(item.productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const subtotal = Number(item.product.price) * Number(item.quantity);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
            <img
              src={getProductImage(item.product)}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg mb-1">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.product.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={removeCartItem.isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(Number(item.quantity) - 1)}
                  disabled={Number(item.quantity) <= 1 || updateCartItem.isPending}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-bold text-lg w-12 text-center">
                  {Number(item.quantity)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(Number(item.quantity) + 1)}
                  disabled={Number(item.quantity) >= Number(item.product.stock) || updateCartItem.isPending}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
                <div className="text-xl font-black text-primary">₹{subtotal}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
