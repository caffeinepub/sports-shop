import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { useGetAllProducts, useRemoveProduct, useIsCallerAdmin } from '../hooks/useQueries';
import ProductForm from '../components/ProductForm';
import AdminUserManagement from '../components/AdminUserManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Product, ProductCategory } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const removeProduct = useRemoveProduct();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || isAdminLoading || productsLoading;

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId: bigint) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await removeProduct.mutateAsync(productId);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black mb-8">Admin Panel</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage your product catalog and admin users
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate({ to: '/admin/orders' })}
              size="lg"
              variant="outline"
              className="font-bold"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              View Orders
            </Button>
            <Button
              onClick={() => setIsFormOpen(true)}
              size="lg"
              className="font-bold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Overview
                </CardTitle>
                <CardDescription>
                  {products?.length || 0} product{products?.length !== 1 ? 's' : ''} in your catalog
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <AdminUserManagement />
          </div>
        </div>

        <div className="space-y-4">
          {productsLoading ? (
            <p>Loading products...</p>
          ) : products && products.length > 0 ? (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id.toString()} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{product.name}</h3>
                          <span className="text-sm px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full font-semibold">
                            {getCategoryLabel(product.category)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-3">{product.description}</p>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Price: </span>
                            <span className="font-bold text-primary">₹{Number(product.price)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stock: </span>
                            <span className="font-semibold">{Number(product.stock)} units</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          disabled={removeProduct.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by adding your first product
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
