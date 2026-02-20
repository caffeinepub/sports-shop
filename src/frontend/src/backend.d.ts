import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    description: string;
    stock: bigint;
    category: ProductCategory;
    price: bigint;
}
export type Cart = Array<CartItem>;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    status: OrderStatus;
    total: bigint;
    paymentMethod: PaymentMethod;
    user: Principal;
    items: Cart;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: bigint, category: ProductCategory, stock: bigint): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(paymentMethod: PaymentMethod): Promise<bigint>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getProduct(productId: bigint): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeProduct(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, price: bigint, category: ProductCategory, stock: bigint): Promise<void>;
}
