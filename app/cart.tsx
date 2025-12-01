import { showGlobalError } from '@/components/error-modal';
import { useCart } from '@/context/CartContext';
import { CartItem, Product } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#00a63e';

export default function CartScreen() {
  const router = useRouter();
  const { cart, loading, cartCount, updateItemQuantity, removeItem, clearCartItems } = useCart();

  const handleUpdateQuantity = async (productId: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, size);
      return;
    }

    try {
      await updateItemQuantity(productId, newQuantity, size);
    } catch {
      showGlobalError({ title: 'Error', message: 'No se pudo actualizar la cantidad', primaryText: 'Entendido' });
    }
  };

  const handleRemoveItem = async (productId: string, size: string) => {
    showGlobalError({ title: 'Eliminar producto', message: '¿Estás seguro de eliminar este producto del carrito?', secondaryText: 'Cancelar', primaryText: 'Eliminar', onPrimary: async () => {
      try { await removeItem(productId, size); } catch { showGlobalError({ title: 'Error', message: 'No se pudo eliminar el producto', primaryText: 'Entendido' }); }
    }});
  };

  const handleClearCart = () => {
    showGlobalError({ title: 'Vaciar carrito', message: '¿Estás seguro de vaciar todo el carrito?', secondaryText: 'Cancelar', primaryText: 'Vaciar', onPrimary: async () => {
      try { await clearCartItems(); } catch { showGlobalError({ title: 'Error', message: 'No se pudo vaciar el carrito', primaryText: 'Entendido' }); }
    }});
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = typeof item.productId === 'object' ? item.productId : null;
      if (product) {
        return total + (product.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const product = typeof item.productId === 'object' ? item.productId as Product : null;
    
    if (!product) return null;

    return (
      <View style={styles.cartItem}>
        <Image
          source={
            product.images && product.images[0]
              ? { uri: product.images[0] }
              : require('@/assets/images/react-logo.png')
          }
          style={styles.productImage}
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          
          {item.size && (
            <Text style={styles.productSize}>Talla: {item.size}</Text>
          )}
          
          <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
          
          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(product._id, item.size, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#1F2937" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>x {item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(product._id, item.size, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtotal}>
            Subtotal: €{(product.price * item.quantity).toFixed(2)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(product._id, item.size)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && cart.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Cargando carrito...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito ({cartCount})</Text>
        {cart.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            {/* <Ionicons name="trash-outline" size={16} color="#FFFFFF" /> */}
            <Text style={styles.clearButtonText}>Vaciar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>
            Añade productos para comenzar tu compra
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.shopButtonText}>Explorar Productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${typeof item.productId === 'object' ? item.productId._id : item.productId}-${item.size}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>€{calculateTotal().toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                router.push('/checkout');
              }}
            >
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productSize: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 40,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: GREEN,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
