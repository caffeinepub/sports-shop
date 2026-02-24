import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductCategory, Product } from '../backend';
import { CartItem as CartItemType } from '../types';
import { useUpdateCartItem, useRemoveCartItem, useGetProduct } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

interface CartItemProps {
  item: CartItemType;
}

const getProductImage = (product: Product): string => {
  // Check if this is the Vixen T.T Ball product
  if (product.name.toLowerCase().includes('vixen') && product.name.toLowerCase().includes('t.t')) {
    return '/assets/generated/vixen-tt-ball.dim_400x400.png';
  }
  
  // Extract category name from ProductCategory union type
  let categoryName = '';
  if (typeof product.category === 'object' && product.category !== null) {
    if ('name' in product.category && '__kind__' in product.category && product.category.__kind__ === 'name') {
      categoryName = product.category.name.toLowerCase();
    }
  }
  
  // Map known categories to images
  if (categoryName.includes('table tennis') || categoryName.includes('tt')) {
    return '/assets/generated/table-tennis-ball.dim_400x400.png';
  } else if (categoryName.includes('badminton')) {
    return '/assets/generated/badminton-shuttle.dim_400x400.png';
  }
  
  // Fallback to a generic image
  return '/assets/generated/table-tennis-ball.dim_400x400.png';
};

export default function CartItem({ item }: CartItemProps) {
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  
  // Cart only contains regular products (not custom stickers)
  const { data: product } = useGetProduct(item.productId);

  const [itemData, setItemData] = useState<{
    name: string;
    description?: string;
    price: bigint;
    image: string;
    stock?: bigint;
  } | null>(null);

  useEffect(() => {
    if (product) {
      console.log('[CartItem] Product in cart:', {
        id: product.id.toString(),
        name: product.name,
        priceInPaise: product.price.toString(),
        priceInRupees: Number(product.price) / 100,
      });
      setItemData({
        name: product.name,
        description: product.description,
        price: product.price,
        image: getProductImage(product),
        stock: product.stock,
      });
    }
  }, [product]);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Check stock for products
    if (itemData && itemData.stock !== undefined) {
      if (newQuantity > Number(itemData.stock)) {
        toast.error('Not enough stock', {
          description: `Only ${itemData.stock} items available.`,
        });
        return;
      }
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

  if (!itemData) {
    return (
      <Card className="animate-pulse">
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
    );
  }

  const quantity = Number(item.quantity);
  const subtotalInPaise = itemData.price * BigInt(quantity);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
            <img
              src={itemData.image}
              alt={itemData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate">{itemData.name}</h3>
            {itemData.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {itemData.description}
              </p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(itemData.price)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                  disabled={quantity <= 1 || updateCartItem.isPending}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  disabled={updateCartItem.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-lg font-bold ml-auto">
                {formatCurrency(subtotalInPaise)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
            disabled={removeCartItem.isPending}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
