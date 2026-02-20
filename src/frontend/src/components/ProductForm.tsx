import { useState, useEffect } from 'react';
import { useAddProduct, useUpdateProduct } from '../hooks/useQueries';
import { ProductCategory } from '../backend';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'tableTennisBalls' | 'badmintonShuttles'>('tableTennisBalls');
  const [stock, setStock] = useState('');

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const isEditMode = !!product;
  const isSubmitting = addProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      
      // ProductCategory is an enum, compare directly
      if (product.category === ProductCategory.tableTennisBalls) {
        setCategory('tableTennisBalls');
      } else if (product.category === ProductCategory.badmintonShuttles) {
        setCategory('badmintonShuttles');
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
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    // Convert category to backend enum format
    const categoryEnum: ProductCategory = 
      category === 'tableTennisBalls' 
        ? ProductCategory.tableTennisBalls 
        : ProductCategory.badmintonShuttles;

    try {
      if (isEditMode && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          category: categoryEnum,
          stock: BigInt(stockNum),
        });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          category: categoryEnum,
          stock: BigInt(stockNum),
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
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value: any) => setCategory(value)} disabled={isSubmitting}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tableTennisBalls">Table Tennis Balls</SelectItem>
              <SelectItem value="badmintonShuttles">Badminton Shuttles</SelectItem>
            </SelectContent>
          </Select>
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
