import { API_BASE_URL } from '@/config/api';
import { CategoriesResponse, Category, Product, ProductsResponse } from '@/types/api';

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
