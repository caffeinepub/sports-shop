import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PaymentMethod, ProductCategory, UserProfile, Product as BackendProduct, UserRole, CustomSticker, ExternalBlob, StickerCategory } from '../backend';
import { Cart } from '../types';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<BackendProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useGetAllProducts] Actor not available');
        return [];
      }
      console.log('[useGetAllProducts] Fetching products from backend...');
      try {
        const products = await actor.getProducts();
        console.log('[useGetAllProducts] Products fetched:', products.length, 'products');
        console.log('[useGetAllProducts] Product IDs:', products.map(p => ({ id: p.id.toString(), name: p.name })));
        return products;
      } catch (error) {
        console.error('[useGetAllProducts] Error fetching products:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<BackendProduct | null>({
    queryKey: ['product', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      console.log('[useGetProduct] Fetching product with ID:', id.toString());
      const product = await actor.getProduct(id);
      if (product) {
        console.log('[useGetProduct] Found product:', { id: product.id.toString(), name: product.name });
      } else {
        console.log('[useGetProduct] Product not found for ID:', id.toString());
      }
      return product;
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGetCart() {
  const { actor, isFetching } = useActor();

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const cart = await actor.getCart();
        console.log('[useGetCart] Cart items:', cart.map(item => ({ 
          productId: item.productId.toString(), 
          quantity: item.quantity.toString() 
        })));
        return cart;
      } catch (error) {
        console.error('[useGetCart] Error fetching cart:', error);
        // Return empty cart on error instead of throwing
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      console.log('[useAddToCart] Adding to cart - Product ID:', productId.toString(), 'Quantity:', quantity.toString());
      try {
        const result = await actor.addToCart(productId, quantity);
        console.log('[useAddToCart] Successfully added product ID', productId.toString(), 'to cart');
        return result;
      } catch (error) {
        console.error('[useAddToCart] Error adding product ID', productId.toString(), ':', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      console.log('[useUpdateCartItem] Updating cart item - Product ID:', productId.toString(), 'New Quantity:', quantity.toString());
      return actor.updateCartItem(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      console.log('[useRemoveCartItem] Removing product ID:', productId.toString());
      return actor.removeCartItem(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentMethod, deliveryAddress }: { paymentMethod: PaymentMethod; deliveryAddress: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      console.log('[useCheckout] Processing checkout...');
      try {
        const orderId = await actor.checkout(paymentMethod, deliveryAddress);
        console.log('[useCheckout] Order placed successfully:', orderId.toString());
        return orderId;
      } catch (error) {
        console.error('[useCheckout] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, category, stock, price }: { name: string; description: string; category: ProductCategory; stock: bigint; price: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addProduct(name, description, category, stock, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, name, description, category, stock, price }: { productId: bigint; name: string; description: string; category: ProductCategory; stock: bigint; price: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateProduct(productId, name, description, category, stock, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.removeProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) {
        console.log('[useIsCallerAdmin] Actor not available, returning false');
        return false;
      }
      
      if (!identity) {
        console.log('[useIsCallerAdmin] Not authenticated, returning false');
        return false;
      }
      
      try {
        console.log('[useIsCallerAdmin] Calling backend isCallerAdmin()...');
        const result = await actor.isCallerAdmin();
        console.log('[useIsCallerAdmin] Backend returned:', result);
        return result;
      } catch (error) {
        console.error('[useIsCallerAdmin] Error checking admin status:', error);
        if (error instanceof Error) {
          console.error('[useIsCallerAdmin] Error message:', error.message);
        }
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    ...query,
    isLoading: actorFetching || isInitializing || query.isLoading,
  };
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: any }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateCustomSticker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image, price, name, category, description }: { image: ExternalBlob; price: bigint; name: string; category: StickerCategory; description: string | null }) => {
      if (!actor) throw new Error('Actor not initialized');
      console.log('[useCreateCustomSticker] Creating custom sticker:', { name, price: price.toString(), category });
      try {
        const result = await actor.createCustomSticker(image, price, name, category, description);
        console.log('[useCreateCustomSticker] Successfully created sticker:', result);
        return result;
      } catch (error) {
        console.error('[useCreateCustomSticker] Error creating sticker:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customStickers'] });
    },
  });
}

export function useGetCallerCustomStickers() {
  const { actor, isFetching } = useActor();

  return useQuery<CustomSticker[]>({
    queryKey: ['customStickers', 'caller'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useGetCallerCustomStickers] Actor not available');
        return [];
      }
      console.log('[useGetCallerCustomStickers] Fetching caller custom stickers...');
      try {
        const stickers = await actor.getCallerCustomStickers();
        console.log('[useGetCallerCustomStickers] Stickers fetched:', stickers.length, 'stickers');
        return stickers;
      } catch (error) {
        console.error('[useGetCallerCustomStickers] Error fetching stickers:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCustomSticker(stickerId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<CustomSticker | null>({
    queryKey: ['customSticker', stickerId?.toString()],
    queryFn: async () => {
      if (!actor || !stickerId) return null;
      console.log('[useGetCustomSticker] Fetching sticker with ID:', stickerId.toString());
      const sticker = await actor.getCustomSticker(stickerId);
      if (sticker) {
        console.log('[useGetCustomSticker] Found sticker:', { id: sticker.id.toString(), name: sticker.name });
      } else {
        console.log('[useGetCustomSticker] Sticker not found for ID:', stickerId.toString());
      }
      return sticker;
    },
    enabled: !!actor && !isFetching && stickerId !== undefined,
  });
}
