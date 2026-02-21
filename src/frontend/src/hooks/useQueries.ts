import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PaymentMethod, ProductCategory, UserProfile, Product as BackendProduct, UserRole } from '../backend';
import { Cart } from '../types';
import { Principal } from '@dfinity/principal';

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<BackendProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
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
      return actor.getProduct(id);
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
        return actor.getCart();
      } catch (error) {
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
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      // The backend doesn't have an update method, so we need to clear and re-add
      // This is a workaround - ideally the backend would have an updateCart method
      const cart = await actor.getCart();
      const otherItems = cart.filter(item => item.productId !== productId);
      
      // We'll need to reconstruct the cart by adding items back
      // Since there's no direct update, we'll just call addToCart
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout'] });
    },
  });
}

export function useRemoveCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      // The backend doesn't have a remove method
      // We'll need to work around this limitation
      throw new Error('Remove cart item not implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout'] });
    },
  });
}

export function useGetCheckoutSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<{ items: Cart; total: bigint }>({
    queryKey: ['checkout'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        const cart = await actor.getCart();
        const products = await actor.getAllProducts();
        
        let total = BigInt(0);
        cart.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            total += product.price * item.quantity;
          }
        });
        
        return { items: cart, total };
      } catch (error) {
        return { items: [], total: BigInt(0) };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCompleteCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentMethod, deliveryAddress }: { paymentMethod: PaymentMethod; deliveryAddress: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.checkout(paymentMethod, deliveryAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['checkout'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Admin hooks
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      category,
      stock,
    }: {
      name: string;
      description: string;
      price: number;
      category: ProductCategory;
      stock: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addProduct(name, description, BigInt(price), category, stock);
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
    mutationFn: async ({
      productId,
      name,
      description,
      price,
      category,
      stock,
    }: {
      productId: bigint;
      name: string;
      description: string;
      price: number;
      category: ProductCategory;
      stock: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateProduct(productId, name, description, BigInt(price), category, stock);
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

// User profile hooks
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

// Orders hooks
export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getAllOrders();
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin role management hooks
export function useAssignAdminRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.assignCallerUserRole(principal, UserRole.admin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
