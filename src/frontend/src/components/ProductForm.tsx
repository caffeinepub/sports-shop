import { useState, useEffect } from 'react';
import { useAddProduct, useUpdateProduct } from '../hooks/useQueries';
import { ProductCategory } from '../backend';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const isEditMode = !!product;
  const isSubmitting = addProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setStock(product.stock.toString());
      setPrice((Number(product.price) / 100).toString());
      
      // Extract category name from ProductCategory union type
      if (typeof product.category === 'object' && product.category !== null) {
        if ('name' in product.category && '__kind__' in product.category && product.category.__kind__ === 'name') {
          setCategory(product.category.name);
        } else if ('__kind__' in product.category && product.category.__kind__ === 'customCategory') {
          setCategory('');
        }
      }
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Product description is required');
      return;
    }
    if (!category.trim()) {
      toast.error('Product category is required');
      return;
    }
    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price greater than 0');
      return;
    }

    // Convert category to backend format using name variant
    const categoryData: ProductCategory = {
      __kind__: 'name',
      name: category.trim(),
    };

    // Convert price from rupees to paise
    const priceInPaise = BigInt(Math.round(priceNum * 100));

    try {
      if (isEditMode && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          name: name.trim(),
          description: description.trim(),
          category: categoryData,
          stock: BigInt(stockNum),
          price: priceInPaise,
        });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          category: categoryData,
          stock: BigInt(stockNum),
          price: priceInPaise,
        });
        toast.success('Product added successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Premium Table Tennis Balls"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product..."
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Table Tennis, Badminton, Cricket"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">Enter any product category</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₹
            </span>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {isEditMode ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>{isEditMode ? 'Update Product' : 'Add Product'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
