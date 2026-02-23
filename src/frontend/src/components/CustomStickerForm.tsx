import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useCreateCustomSticker } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ExternalBlob, StickerCategory } from '../backend';

interface CustomStickerFormProps {
  onSuccess?: () => void;
}

export default function CustomStickerForm({ onSuccess }: CustomStickerFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<StickerCategory | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createSticker = useCreateCustomSticker();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type', {
          description: 'Please select an image file (PNG, JPG, or GIF).',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Please select an image smaller than 5MB.',
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Name is required', {
        description: 'Please enter a name for your sticker.',
      });
      return;
    }

    if (!category) {
      toast.error('Category is required', {
        description: 'Please select a category for your sticker.',
      });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Invalid price', {
        description: 'Please enter a valid price greater than 0.',
      });
      return;
    }

    if (!imageFile) {
      toast.error('Image is required', {
        description: 'Please select an image for your sticker.',
      });
      return;
    }

    try {
      // Convert file to Uint8Array
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Convert price from rupees to paise (multiply by 100)
      const priceInRupees = parseFloat(price);
      const priceInPaise = BigInt(Math.round(priceInRupees * 100));
      
      console.log('[CustomStickerForm] Price conversion:', {
        inputPrice: price,
        priceInRupees,
        priceInPaise: priceInPaise.toString(),
        category,
      });

      const result = await createSticker.mutateAsync({
        image: blob,
        price: priceInPaise,
        name: name.trim(),
        category: category as StickerCategory,
        description: description.trim() || null,
      });

      console.log('[CustomStickerForm] Sticker created:', {
        id: result.id.toString(),
        name: result.name,
        category: result.category,
        price: result.price.toString(),
        priceInRupees: Number(result.price) / 100,
      });

      toast.success('Custom sticker created!', {
        description: 'Your sticker has been added successfully.',
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);

      onSuccess?.();
    } catch (error) {
      console.error('[CustomStickerForm] Create sticker error:', error);
      toast.error('Failed to create sticker', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const isSubmitting = createSticker.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="image">Sticker Image *</Label>
        <div className="flex flex-col gap-4">
          <Input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            onChange={handleImageChange}
            disabled={isSubmitting}
            className="cursor-pointer"
          />
          {imagePreview ? (
            <Card className="p-4">
              <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden bg-muted/30">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-dashed">
              <div className="flex flex-col items-center justify-center text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload an image (PNG, JPG, or GIF)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 5MB
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Sticker Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter sticker name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as StickerCategory)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={StickerCategory.sports}>Sports</SelectItem>
            <SelectItem value={StickerCategory.animals}>Animals</SelectItem>
            <SelectItem value={StickerCategory.food}>Food</SelectItem>
            <SelectItem value={StickerCategory.cartoon}>Cartoon</SelectItem>
            <SelectItem value={StickerCategory.patterns}>Patterns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter a description for your sticker"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Price (₹) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
            className="pl-8"
            required
          />
        </div>
      </div>

      {/* Upload Progress */}
      {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-semibold">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full font-bold"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Upload className="mr-2 h-5 w-5 animate-pulse" />
            Creating Sticker...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Create Sticker
          </>
        )}
      </Button>
    </form>
  );
}
