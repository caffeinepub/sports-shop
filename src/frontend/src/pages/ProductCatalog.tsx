import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '../components/ProductCard';
import { useGetAllProducts } from '../hooks/useQueries';
import { Package } from 'lucide-react';

export default function ProductCatalog() {
  const { data: products, isLoading, error } = useGetAllProducts();

  // Debug logging
  useEffect(() => {
    console.log('=== ProductCatalog Debug ===');
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.log('products:', products);
    console.log('products length:', products?.length);
    console.log('===========================');
  }, [isLoading, error, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-[300px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/generated/hero-banner.dim_1200x400.png')] bg-cover bg-center opacity-30" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black mb-4 text-foreground drop-shadow-lg">
              yourdailysprtshop
            </h1>
            <p className="text-xl md:text-2xl font-bold text-muted-foreground">
              Your Daily Sports Equipment Store
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-3xl font-black mb-4">Failed to load products</h2>
          <p className="text-muted-foreground mb-8">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-[300px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/generated/hero-banner.dim_1200x400.png')] bg-cover bg-center opacity-30" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black mb-4 text-foreground drop-shadow-lg">
              yourdailysprtshop
            </h1>
            <p className="text-xl md:text-2xl font-bold text-muted-foreground">
              Your Daily Sports Equipment Store
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-3xl font-black mb-4">No products available</h2>
            <p className="text-muted-foreground">
              Check back soon for new products!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[300px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/generated/hero-banner.dim_1200x400.png')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-foreground drop-shadow-lg">
            yourdailysprtshop
          </h1>
          <p className="text-xl md:text-2xl font-bold text-muted-foreground">
            Your Daily Sports Equipment Store
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id.toString()} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
