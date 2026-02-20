import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '../components/ProductCard';
import { useGetAllProducts } from '../hooks/useQueries';
import { Package } from 'lucide-react';

export default function ProductCatalog() {
  const { data: products, isLoading, error } = useGetAllProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="relative h-64 bg-gradient-to-r from-primary/90 to-secondary/90 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/generated/hero-banner.dim_1200x400.png')] bg-cover bg-center opacity-20" />
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              yourdailysprtshop
            </h1>
            <p className="text-xl md:text-2xl font-bold opacity-90">
              Your Daily Sports Essentials
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-8 bg-muted rounded w-1/3" />
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
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold mb-4">Failed to load products</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="relative h-64 bg-gradient-to-r from-primary/90 to-secondary/90 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/generated/hero-banner.dim_1200x400.png')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            yourdailysprtshop
          </h1>
          <p className="text-xl md:text-2xl font-bold opacity-90">
            Your Daily Sports Essentials
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-4">No products available</h2>
            <p className="text-muted-foreground">Check back soon for new items!</p>
          </div>
        )}
      </div>
    </div>
  );
}
