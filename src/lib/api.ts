const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface Order {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  total_amount: string;
  is_paid: boolean;
  paid_at: string | null;
  items: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      price: string;
      image?: string;
    };
    quantity: number;
    price: string;
  }>;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  parent_category_id?: number | null;
  subcategories?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
  }>;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  sku: string;
  image: string;
  stock: number;
  is_active: boolean;
  category: number;
  images: Array<{ id: number; image: string; color: string; alt_text: string; ordering: number }>;
  // Optional discount data returned by the API
  discount?: {
    id: number;
    original_price: string;
    discount_price: string;
    is_active: boolean;
  } | null;
  discount_price?: string | null;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  blog_type: 'manual' | 'pdf';
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  pdf_file: string | null;
  pdf_thumbnail: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminStats {
  product_count: number;
  category_count: number;
  order_count: number;
  recent_orders: Order[];
  low_stock: Product[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    // Read raw response text (handles empty bodies and non-json responses)
    const rawText = await response.text().catch(() => "");

    if (!response.ok) {
      // Try to parse JSON error, otherwise include raw text
      let errorData: any = rawText || {};
      try {
        errorData = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        // keep raw text
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    // No content
    if (response.status === 204 || !rawText) {
      return {} as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch (e) {
      // If parsing fails, return raw text as any
      return rawText as unknown as T;
    }
  }

  // Auth API
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/accounts/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Login failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    return {
      access: data.access,
      refresh: data.refresh,
      user: {
        id: 0,
        username: username,
        email: '',
        first_name: '',
        last_name: '',
      },
    };
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/accounts/me/');
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/admin/orders/');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/`);
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async markOrderAsPaid(id: number): Promise<Order> {
    return this.updateOrder(id, { is_paid: true });
  }

  // Products API (Admin)
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/catalog/admin/products/');
  }

  // Lightweight admin dashboard stats (fast endpoint)
  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/admin/stats/');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/catalog/admin/products/${id}/`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>('/catalog/admin/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/catalog/admin/products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/catalog/admin/products/${id}/`, {
      method: 'DELETE',
    });
  }

  // Categories API (Admin)
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/catalog/admin/categories/');
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/catalog/admin/categories/${id}/`);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.request<Category>('/catalog/admin/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/catalog/admin/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/catalog/admin/categories/${id}/`, {
      method: 'DELETE',
    });
  }

  async uploadProductImage(productId: number, imageFile: File, color: string, altText: string = '', clearOld: boolean = false): Promise<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('color', color);
    formData.append('alt_text', altText);
    formData.append('clear_old', clearOld.toString());

    const url = `${this.baseURL}/catalog/admin/products/${productId}/upload-image/`;
    const token = localStorage.getItem('admin_token');
    
    console.log('uploadProductImage:', {
      url,
      productId,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      color,
      hasToken: !!token,
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    console.log('uploadProductImage response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  async deleteProductImage(imageId: number): Promise<void> {
    return this.request<void>(`/catalog/admin/images/${imageId}/delete/`, {
      method: 'DELETE',
    });
  }

  // Blogs API (Admin)
  async getBlogs(): Promise<Blog[]> {
    return this.request<Blog[]>('/blogs/admin/blogs/');
  }

  async getBlog(id: number): Promise<Blog> {
    return this.request<Blog>(`/blogs/admin/blogs/${id}/`);
  }

  async createBlog(data: Partial<Blog>): Promise<Blog> {
    return this.request<Blog>('/blogs/admin/blogs/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlog(id: number, data: Partial<Blog>): Promise<Blog> {
    return this.request<Blog>(`/blogs/admin/blogs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBlog(id: number): Promise<void> {
    return this.request<void>(`/blogs/admin/blogs/${id}/`, {
      method: 'DELETE',
    });
  }

  async uploadBlogImage(blogId: number, imageFile: File, altText: string = '', ordering: number = 0): Promise<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('alt_text', altText);
    formData.append('ordering', ordering.toString());

    const url = `${this.baseURL}/blogs/admin/blogs/${blogId}/upload-multi-image/`;
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Upload failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  async uploadBlogFeaturedImage(blogId: number, imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('featured_image', imageFile);

    const url = `${this.baseURL}/blogs/admin/blogs/${blogId}/upload-image/`;
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Upload failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  async uploadBlogPDF(blogId: number, pdfFile: File, thumbnailFile?: File | null): Promise<any> {
    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    
    if (thumbnailFile) {
      formData.append('pdf_thumbnail', thumbnailFile);
    }

    const url = `${this.baseURL}/blogs/admin/blogs/${blogId}/upload-pdf/`;
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Upload failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { Order, Category, Product, Blog, LoginResponse };