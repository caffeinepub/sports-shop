import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import { CustomSticker, StickerCategory } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { toast } from 'sonner';

interface CustomStickerCardProps {
  sticker: CustomSticker;
}

const getCategoryLabel = (category: StickerCategory): string => {
  switch (category) {
    case StickerCategory.sports:
      return 'Sports';
    case StickerCategory.animals:
      return 'Animals';
    case StickerCategory.food:
      return 'Food';
    case StickerCategory.cartoon:
      return 'Cartoon';
    case StickerCategory.patterns:
      return 'Patterns';
    default:
      return 'Other';
  }
};

export default function CustomStickerCard({ sticker }: CustomStickerCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart.mutateAsync({ productId: sticker.id, quantity: BigInt(1) });
      toast.success('Added to cart!', {
        description: `${sticker.name} has been added to your cart.`,
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

  // Convert price from paise to rupees
  const priceInRupees = Number(sticker.price) / 100;

  console.log('[CustomStickerCard] Displaying sticker:', {
    id: sticker.id.toString(),
    name: sticker.name,
    category: sticker.category,
    priceInPaise: sticker.price.toString(),
    priceInRupees,
  });

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-muted/30">
          {!imageError ? (
            <img
              src={sticker.image.getDirectURL()}
              alt={sticker.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-semibold">
              {getCategoryLabel(sticker.category)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-2xl mb-2 font-black tracking-tight">
          {sticker.name}
        </CardTitle>
        {sticker.description && (
          <p className="text-base text-muted-foreground mb-4 line-clamp-2">
            {sticker.description}
          </p>
        )}
        <div className="text-3xl font-black text-primary">
          ₹{priceInRupees.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full font-bold text-base h-12"
          size="lg"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
