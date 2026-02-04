// Django API Client for Sokoni Kiganjani
// This replaces Supabase with a Django REST API backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Debug mode - set to true during development
const DEBUG_MODE = process.env.NODE_ENV === "development";

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage (client-side only)
export function initializeAuth() {
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("access_token");
    refreshToken = localStorage.getItem("refresh_token");
  }
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
}

export function getAccessToken() {
  if (typeof window !== "undefined" && !accessToken) {
    accessToken = localStorage.getItem("access_token");
  }
  return accessToken;
}

// API Request Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = getAccessToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    if (DEBUG_MODE) {
      console.log(`[API] ${options.method || "GET"} ${url}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (DEBUG_MODE && !response.ok) {
      console.log(`[API] Response status: ${response.status}`);
    }

    // Handle 401 - try to refresh token
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
        const retryResponse = await fetch(url, { ...options, headers });
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return { data, error: null };
        }
      }
      // If refresh failed, clear tokens and return error
      clearTokens();
      return { data: null, error: "Session expired. Please login again." };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        data: null, 
        error: errorData.detail || errorData.message || `Request failed with status ${response.status}` 
      };
    }

    // Handle empty responses
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("[API] Request Error:", error);
    
    // Provide helpful error messages for common issues
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return { 
        data: null, 
        error: `Cannot connect to the backend server at ${API_BASE_URL}. Make sure your Django server is running.` 
      };
    }
    
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Network error occurred" 
    };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access;
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access);
      }
      return true;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
  return false;
}

// ============================================
// AUTH API
// ============================================
export const authApi = {
  async login(email: string, password: string) {
    const result = await apiRequest<{
      access: string;
      refresh: string;
      user: {
        id: string;
        email: string;
        full_name: string;
        phone: string;
        role: string;
        avatar_url: string | null;
      };
    }>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.data) {
      setTokens(result.data.access, result.data.refresh);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }
    }

    return result;
  },

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: string;
  }) {
    return apiRequest<{ message: string }>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async logout() {
    const result = await apiRequest("/api/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
    clearTokens();
    return result;
  },

  async getProfile() {
    return apiRequest<{
      id: string;
      email: string;
      full_name: string;
      phone: string;
      role: string;
      avatar_url: string | null;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
      created_at: string;
    }>("/api/auth/profile/");
  },

  async updateProfile(data: Partial<{
    full_name: string;
    phone: string;
    address: string;
    avatar_url: string;
  }>) {
    return apiRequest("/api/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isAuthenticated() {
    return !!getAccessToken();
  },
};

// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
  async getAll(params?: {
    search?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    sort?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category_id) searchParams.set("category_id", params.category_id);
    if (params?.min_price) searchParams.set("min_price", params.min_price.toString());
    if (params?.max_price) searchParams.set("max_price", params.max_price.toString());
    if (params?.featured) searchParams.set("featured", "true");
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return apiRequest<{
      results: Array<{
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
        shop: { id: string; name: string; rating: number };
        category: { id: string; name: string; slug: string };
      }>;
      count: number;
    }>(`/api/products/${query ? `?${query}` : ""}`);
  },

  async getById(id: string) {
    return apiRequest<{
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
      shop: { id: string; name: string; rating: number; address: string };
      category: { id: string; name: string; slug: string };
      reviews: Array<{
        id: string;
        rating: number;
        comment: string;
        user: { full_name: string };
        created_at: string;
      }>;
    }>(`/api/products/${id}/`);
  },

  async create(data: {
    name: string;
    description?: string;
    price: number;
    discount_price?: number;
    stock_quantity: number;
    category_id: string;
    images: string[];
    is_featured?: boolean;
  }) {
    return apiRequest("/api/products/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    discount_price: number;
    stock_quantity: number;
    category_id: string;
    images: string[];
    is_active: boolean;
    is_featured: boolean;
  }>) {
    return apiRequest(`/api/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/products/${id}/`, {
      method: "DELETE",
    });
  },
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesApi = {
  async getAll() {
    return apiRequest<Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      icon: string | null;
      parent_id: string | null;
      is_active: boolean;
      sort_order: number;
    }>>("/api/categories/");
  },

  async getById(id: string) {
    return apiRequest(`/api/categories/${id}/`);
  },
};

// ============================================
// CART API
// ============================================
export const cartApi = {
  async getItems() {
    return apiRequest<Array<{
      id: string;
      product_id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        discount_price: number | null;
        images: string[];
        stock_quantity: number;
        shop: { id: string; name: string };
      };
    }>>("/api/cart/");
  },

  async addItem(productId: string, quantity: number = 1) {
    return apiRequest("/api/cart/add/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async updateQuantity(itemId: string, quantity: number) {
    return apiRequest(`/api/cart/${itemId}/`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  async removeItem(itemId: string) {
    return apiRequest(`/api/cart/${itemId}/`, {
      method: "DELETE",
    });
  },

  async clear() {
    return apiRequest("/api/cart/clear/", {
      method: "DELETE",
    });
  },

  async getCount() {
    return apiRequest<{ count: number }>("/api/cart/count/");
  },
};

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
  async getAll(params?: { status?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    
    return apiRequest<Array<{
      id: string;
      shop_id: string;
      status: string;
      subtotal: number;
      delivery_fee: number;
      platform_fee: number;
      total_amount: number;
      delivery_address: string;
      notes: string | null;
      created_at: string;
      shop: { id: string; name: string };
      items: Array<{
        id: string;
        product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        product: { name: string; images: string[] };
      }>;
    }>>(`/api/orders/${query ? `?${query}` : ""}`);
  },

  async getById(id: string) {
    return apiRequest(`/api/orders/${id}/`);
  },

  async create(data: {
    delivery_address: string;
    phone: string;
    notes?: string;
    payment_method: string;
  }) {
    return apiRequest<{ id: string; message: string }>("/api/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: string, status: string) {
    return apiRequest(`/api/orders/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async cancel(id: string) {
    return apiRequest(`/api/orders/${id}/cancel/`, {
      method: "POST",
    });
  },
};

// ============================================
// SHOPS API
// ============================================
export const shopsApi = {
  async getAll(params?: { search?: string; verified?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.verified !== undefined) searchParams.set("verified", params.verified.toString());
    const query = searchParams.toString();

    return apiRequest<Array<{
      id: string;
      name: string;
      description: string | null;
      logo_url: string | null;
      address: string;
      is_verified: boolean;
      rating: number;
      total_reviews: number;
    }>>(`/api/shops/${query ? `?${query}` : ""}`);
  },

  async getById(id: string) {
    return apiRequest(`/api/shops/${id}/`);
  },

  async getMyShop() {
    return apiRequest<{
      id: string;
      name: string;
      description: string | null;
      logo_url: string | null;
      banner_url: string | null;
      address: string;
      phone: string | null;
      email: string | null;
      is_verified: boolean;
      is_active: boolean;
      rating: number;
      total_reviews: number;
    }>("/api/shops/my-shop/");
  },

  async create(data: {
    name: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
  }) {
    return apiRequest("/api/shops/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(data: Partial<{
    name: string;
    description: string;
    logo_url: string;
    banner_url: string;
    address: string;
    phone: string;
    email: string;
    is_active: boolean;
  }>) {
    return apiRequest("/api/shops/my-shop/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getStats() {
    return apiRequest<{
      total_products: number;
      total_orders: number;
      pending_orders: number;
      total_revenue: number;
    }>("/api/shops/my-shop/stats/");
  },

  async getOrders(params?: { status?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();

    return apiRequest(`/api/shops/my-shop/orders/${query ? `?${query}` : ""}`);
  },
};

// ============================================
// DELIVERIES API (for Boda riders)
// ============================================
export const deliveriesApi = {
  async getAvailable() {
    return apiRequest<Array<{
      id: string;
      order_id: string;
      order_number: string;
      pickup_address: string;
      delivery_address: string;
      distance_km: number;
      delivery_fee: number;
      status: string;
    }>>("/api/deliveries/available/");
  },

  async getMyDeliveries(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();

    return apiRequest(`/api/deliveries/my-deliveries/${query ? `?${query}` : ""}`);
  },

  async getActive() {
    return apiRequest<{
      id: string;
      order_id: string;
      order_number: string;
      pickup_address: string;
      delivery_address: string;
      customer_name: string;
      customer_phone: string;
      distance_km: number;
      delivery_fee: number;
      status: string;
    } | null>("/api/deliveries/active/");
  },

  async accept(deliveryId: string) {
    return apiRequest(`/api/deliveries/${deliveryId}/accept/`, {
      method: "POST",
    });
  },

  async updateStatus(deliveryId: string, status: string) {
    return apiRequest(`/api/deliveries/${deliveryId}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async getStats() {
    return apiRequest<{
      today_deliveries: number;
      today_earnings: number;
      total_deliveries: number;
      total_earnings: number;
      rating: number;
    }>("/api/deliveries/stats/");
  },

  async getBodaProfile() {
    return apiRequest<{
      id: string;
      vehicle_type: string;
      vehicle_plate: string;
      license_number: string;
      is_available: boolean;
      is_verified: boolean;
      rating: number;
      total_deliveries: number;
      total_earnings: number;
    }>("/api/boda/profile/");
  },

  async updateBodaProfile(data: Partial<{
    vehicle_type: string;
    vehicle_plate: string;
    license_number: string;
    is_available: boolean;
  }>) {
    return apiRequest("/api/boda/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminApi = {
  async getUsers(params?: { role?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();

    return apiRequest(`/api/admin/users/${query ? `?${query}` : ""}`);
  },

  async updateUser(userId: string, data: Partial<{ role: string; is_active: boolean }>) {
    return apiRequest(`/api/admin/users/${userId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getShops(params?: { verified?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.verified !== undefined) searchParams.set("verified", params.verified.toString());
    const query = searchParams.toString();

    return apiRequest(`/api/admin/shops/${query ? `?${query}` : ""}`);
  },

  async verifyShop(shopId: string) {
    return apiRequest(`/api/admin/shops/${shopId}/verify/`, {
      method: "POST",
    });
  },

  async getOrders(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();

    return apiRequest(`/api/admin/orders/${query ? `?${query}` : ""}`);
  },

  async getPayments(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();

    return apiRequest(`/api/admin/payments/${query ? `?${query}` : ""}`);
  },

  async getDashboardStats() {
    return apiRequest<{
      total_users: number;
      total_shops: number;
      total_orders: number;
      total_revenue: number;
      pending_shops: number;
      pending_orders: number;
    }>("/api/admin/stats/");
  },
};

// ============================================
// REVIEWS API
// ============================================
export const reviewsApi = {
  async create(data: {
    product_id?: string;
    shop_id?: string;
    order_id: string;
    rating: number;
    comment?: string;
  }) {
    return apiRequest("/api/reviews/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getForProduct(productId: string) {
    return apiRequest(`/api/reviews/product/${productId}/`);
  },

  async getForShop(shopId: string) {
    return apiRequest(`/api/reviews/shop/${shopId}/`);
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  async getAll() {
    return apiRequest<Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      is_read: boolean;
      created_at: string;
    }>>("/api/notifications/");
  },

  async markAsRead(id: string) {
    return apiRequest(`/api/notifications/${id}/read/`, {
      method: "POST",
    });
  },

  async markAllAsRead() {
    return apiRequest("/api/notifications/read-all/", {
      method: "POST",
    });
  },

  async getUnreadCount() {
    return apiRequest<{ count: number }>("/api/notifications/unread-count/");
  },
};

// Initialize auth on module load (client-side)
if (typeof window !== "undefined") {
  initializeAuth();
}
