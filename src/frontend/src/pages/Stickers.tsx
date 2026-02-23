import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Sparkles } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerCustomStickers } from '../hooks/useQueries';
import CustomStickerCard from '../components/CustomStickerCard';
import CustomStickerForm from '../components/CustomStickerForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Stickers() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: customStickers, isLoading } = useGetCallerCustomStickers();

  console.log('[Stickers] Custom stickers loaded:', {
    count: customStickers?.length || 0,
    stickers: customStickers?.map(s => ({
      id: s.id.toString(),
      name: s.name,
      price: s.price.toString(),
    })),
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Sparkles className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-black mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please login to create and manage your custom stickers.
          </p>
          <Button onClick={() => login()} size="lg" className="font-bold">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">My Custom Stickers</h1>
            <p className="text-muted-foreground">
              Create and manage your personalized stickers
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            size="lg" 
            className="font-bold gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Custom Sticker
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : customStickers && customStickers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customStickers.map((sticker) => (
              <CustomStickerCard key={Number(sticker.id)} sticker={sticker} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">You haven't created any custom stickers yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating your personalized stickers with your own images and prices!
            </p>
            <Button onClick={() => setIsFormOpen(true)} size="lg" className="font-bold gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Sticker
            </Button>
          </Card>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Create Custom Sticker</DialogTitle>
            </DialogHeader>
            <CustomStickerForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
