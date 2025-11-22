// Tipos basados en los modelos de MongoDB
export interface SizeStock {
  size: 'S' | 'M' | 'L' | 'XL';
  stock: number;
  _id?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productsCount?: number;
  materials?: string;
  priceRange?: string;
  isActive?: boolean;
  position?: number;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sizeStock: SizeStock[];
  category: Category | string;
  sizes: string[];
  images: string[];
  material?: string;
  ecoFriendly?: boolean;
  rating: number;
  reviews: number;
  isActive?: boolean;
  createdAt?: string;
  totalStock?: number;
  availableSizes?: string[];
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
