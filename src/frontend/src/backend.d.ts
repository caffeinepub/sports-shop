import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Order {
    customerName: string;
    status: OrderStatus;
    deliveryAddress: string;
    total: bigint;
    paymentMethod: PaymentMethod;
    user: Principal;
    items: Cart;
}
export interface CustomSticker {
    id: bigint;
    creator: Principal;
    name: string;
    description?: string;
    category: StickerCategory;
    image: ExternalBlob;
    price: bigint;
}
export type Cart = Array<CartItem>;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    stock: bigint;
    category: ProductCategory;
    price: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed"
}
export enum PaymentMethod {
    cash = "cash",
    googlePay = "googlePay"
}
export enum ProductCategory {
    tableTennisBalls = "tableTennisBalls",
    badmintonShuttles = "badmintonShuttles"
}
export enum StickerCategory {
    patterns = "patterns",
    food = "food",
    animals = "animals",
    sports = "sports",
    cartoon = "cartoon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, category: ProductCategory, stock: bigint): Promise<bigint | null>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(paymentMethod: PaymentMethod, deliveryAddress: string): Promise<bigint>;
    clearCart(): Promise<void>;
    createCustomSticker(image: ExternalBlob, price: bigint, name: string, category: StickerCategory, description: string | null): Promise<CustomSticker>;
    getAllCustomStickers(): Promise<Array<CustomSticker>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerCustomStickers(): Promise<Array<CustomSticker>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCustomSticker(stickerId: bigint): Promise<CustomSticker | null>;
    getCustomStickersByUser(user: Principal): Promise<Array<CustomSticker>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getUserOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    removeCartItem(productId: bigint): Promise<void>;
    removeProduct(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, category: ProductCategory, stock: bigint): Promise<void>;
}
