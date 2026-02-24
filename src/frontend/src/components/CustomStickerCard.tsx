import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import { CustomSticker, StickerCategory } from '../backend';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatCurrency';

interface CustomStickerCardProps {
  sticker: CustomSticker;
}

const getCategoryLabel = (category: StickerCategory): string => {
  if (typeof category === 'object' && category !== null) {
    if ('name' in category && '__kind__' in category && category.__kind__ === 'name') {
      return category.name;
    } else if ('__kind__' in category && category.__kind__ === 'customCategory') {
      return 'Custom';
    }
  }
  return 'Other';
};

export default function CustomStickerCard({ sticker }: CustomStickerCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    // Custom stickers cannot be added to cart - the backend cart system only supports regular products
    toast.error('Feature not available', {
      description: 'Custom stickers cannot be added to cart at this time.',
    });
  };

  console.log('[CustomStickerCard] Displaying sticker:', {
    id: sticker.id.toString(),
    name: sticker.name,
    category: sticker.category,
    priceInPaise: sticker.price.toString(),
    priceInRupees: Number(sticker.price) / 100,
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
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {sticker.description}
          </p>
        )}
        <div className="text-3xl font-black text-primary">
          {formatCurrency(sticker.price)}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full font-bold text-base h-12"
          size="lg"
          onClick={handleAddToCart}
          variant="outline"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
