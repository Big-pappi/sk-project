export type UserRole = "customer" | "seller" | "boda" | "admin" | "super_admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  shop?: Shop;
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  shop_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  total_amount: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shop?: Shop;
  items?: OrderItem[];
  delivery?: Delivery;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export type DeliveryStatus = "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";

export interface Delivery {
  id: string;
  order_id: string;
  boda_id: string | null;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  distance_km: number | null;
  estimated_time: number | null;
  actual_pickup_time: string | null;
  actual_delivery_time: string | null;
  delivery_fee: number;
  boda_earnings: number;
  created_at: string;
  updated_at: string;
  boda?: BodaProfile;
}

export interface BodaProfile {
  id: string;
  user_id: string;
  vehicle_type: string;
  vehicle_plate: string;
  license_number: string;
  is_available: boolean;
  is_verified: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  total_deliveries: number;
  rating: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  transaction_id: string | null;
  seller_amount: number;
  platform_amount: number;
  boda_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  shop_id: string | null;
  product_id: string | null;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}
