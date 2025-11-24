import { API_BASE_URL } from '@/config/api';
import { CartItem, CategoriesResponse, Category, Product, ProductsResponse } from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper para obtener el token de autenticación
async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Helper para verificar si hay usuario logueado
export async function isUserLoggedIn(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}

// Helper para headers con auth
async function getHeaders(includeAuth: boolean = false): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Obtener lista de productos con paginación y filtros
 */
export async function getProducts(params?: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  sort?: string;
}): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.q) queryParams.append('q', params.q);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sort) queryParams.append('sort', params.sort);

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: ProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProduct(id: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: Product = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Buscar producto por nombre
 */
export async function searchProductByName(nombre: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/search/${encodeURIComponent(nombre)}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching product:', error);
    throw error;
  }
}

/**
 * Obtener lista de categorías con paginación y filtros
 */
export async function getCategories(params?: {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean;
  sort?: string;
}): Promise<CategoriesResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.q) queryParams.append('q', params.q);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const url = `${API_BASE_URL}/categories?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: CategoriesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Obtener una categoría por ID
 */
export async function getCategory(id: string): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: Category = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

/**
 * Verificar disponibilidad de stock para una talla específica
 */
export async function checkStock(productId: string, size: string, quantity: number): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/stock/${size}?quantity=${quantity}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking stock:', error);
    throw error;
  }
}

// ==================== CART API ====================

/**
 * Obtener el carrito del usuario
 */
export async function getCart(): Promise<CartItem[]> {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(`${API_BASE_URL}/cart`, { headers });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: CartItem[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

/**
 * Añadir ítem al carrito
 */
export async function addToCart(productId: string, quantity: number = 1, size: string = ''): Promise<CartItem[]> {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity, size }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}`);
    }

    const data: CartItem[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Actualizar cantidad de un ítem en el carrito
 * Primero elimina el item y luego lo vuelve a agregar con la nueva cantidad
 */
export async function updateCartItemQuantity(productId: string, quantity: number, size: string = ''): Promise<CartItem[]> {
  try {
    // Primero eliminar el item actual
    await removeFromCart(productId, size);
    
    // Luego agregarlo con la nueva cantidad
    const data = await addToCart(productId, quantity, size);
    return data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
}

/**
 * Eliminar ítem del carrito
 */
export async function removeFromCart(productId: string, size: string = ''): Promise<CartItem[]> {
  try {
    const headers = await getHeaders(true);
    const url = size 
      ? `${API_BASE_URL}/cart/items/${productId}?size=${encodeURIComponent(size)}`
      : `${API_BASE_URL}/cart/items/${productId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: CartItem[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Vaciar el carrito
 */
export async function clearCart(): Promise<CartItem[]> {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: CartItem[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// ==================== RESERVATIONS API ====================

/**
 * Crear una reserva temporal
 */
export async function createReservation(
  productId: string, 
  size: string = '', 
  quantity: number = 1, 
  ttlMinutes: number = 10
): Promise<any> {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, size, quantity, ttlMinutes }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

/**
 * Liberar reservas
 */
export async function releaseReservation(productId?: string, size?: string): Promise<any> {
  try {
    const headers = await getHeaders(true);
    const body: any = {};
    if (productId) body.productId = productId;
    if (size) body.size = size;
    
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error releasing reservation:', error);
    throw error;
  }
}

/**
 * Confirmar reservas (decrementar stock)
 */
export async function confirmReservations(): Promise<any> {
  try {
    const headers = await getHeaders(true);
    const response = await fetch(`${API_BASE_URL}/reservations/confirm`, {
      method: 'POST',
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error confirming reservations:', error);
    throw error;
  }
}
