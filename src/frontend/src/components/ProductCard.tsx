import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { ProductCategory, Product } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
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

const getCategoryLabel = (category: ProductCategory): string => {
  switch (category) {
    case ProductCategory.tableTennisBalls:
      return 'Table Tennis';
    case ProductCategory.badmintonShuttles:
      return 'Badminton';
    default:
      return 'Sports';
  }
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addToCart = useAddToCart();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first', {
        description: 'You need to be logged in to add items to cart.',
        action: {
          label: 'Login',
          onClick: () => login(),
        },
      });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success('Added to cart!', {
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = Number(product.stock) === 0;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-muted/30">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 font-bold shadow-lg"
          >
            {getCategoryLabel(product.category)}
          </Badge>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-2xl mb-2 font-black tracking-tight">
          {product.name}
        </CardTitle>
        <CardDescription className="text-base mb-4 line-clamp-2">
          {product.description}
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-black text-primary">
            ₹{Number(product.price)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="font-semibold">{Number(product.stock)} in stock</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full font-bold text-base h-12"
          size="lg"
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAdding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
