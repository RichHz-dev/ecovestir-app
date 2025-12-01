import { useCart } from '@/context/CartContext';
import { getProducts, isUserLoggedIn } from '@/services/api';
import { Product } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#00a63e';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ limit: 100 });
        const foundProduct = data.data.find((p) => p._id === id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          // Seleccionar primera talla disponible
          if (foundProduct.availableSizes && foundProduct.availableSizes.length > 0) {
            setSelectedSize(foundProduct.availableSizes[0]);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getStockForSize = (size: string) => {
    if (!product) return 0;
    const sizeStock = product.sizeStock.find(s => s.size === size);
    return sizeStock?.stock || 0;
  };

  const handleAddToCart = async () => {
    // Verificar si el usuario está logueado
    const loggedIn = await isUserLoggedIn();
    
    if (!loggedIn) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para agregar productos al carrito',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ir a Login', 
            onPress: () => router.push('/login')
          }
        ]
      );
      return;
    }

    // Verificar que se haya seleccionado una talla
    if (!selectedSize) {
      Alert.alert('Selecciona una talla', 'Por favor selecciona una talla antes de agregar al carrito');
      return;
    }

    // Verificar stock disponible
    const stockAvailable = getStockForSize(selectedSize);
    if (stockAvailable <= 0) {
      Alert.alert('Sin stock', 'Esta talla no está disponible en este momento');
      return;
    }

    try {
      await addItem(id!, 1, selectedSize);
      router.push('/cart');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el producto al carrito');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Producto no encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="heart-outline" size={24} color="#1F2937" />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {product.ecoFriendly && (
            <View style={styles.ecoBadge}>
              <Ionicons name="leaf" size={16} color="#FFFFFF" />
            </View>
          )}
          <Image
            source={
              product.images && product.images[currentImageIndex]
                ? { uri: product.images[currentImageIndex] }
                : require('@/assets/images/react-logo.png')
            }
            style={styles.productImage}
            resizeMode="cover"
          />
          {/* Image Dots */}
          {product.images && product.images.length > 1 && (
            <View style={styles.dotsContainer}>
              {product.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                size={16}
                color="#FFA500"
              />
            ))}
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviews || 120} reseñas)
            </Text>
          </View>

          {/* Size Selector */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Talla</Text>
            <View style={styles.sizesContainer}>
              {['S', 'M', 'L', 'XL'].map((size) => {
                const stock = getStockForSize(size);
                const isAvailable = stock > 0;
                const isSelected = selectedSize === size;
                
                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      isSelected && styles.sizeButtonSelected,
                      !isAvailable && styles.sizeButtonDisabled,
                    ]}
                    onPress={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        isSelected && styles.sizeTextSelected,
                        !isAvailable && styles.sizeTextDisabled,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Expandable Sections */}
          <View style={styles.expandableContainer}>
            {/* Descripción */}
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => toggleSection('description')}
            >
              <Text style={styles.expandableTitle}>Descripción</Text>
              <Ionicons
                name={expandedSection === 'description' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            {expandedSection === 'description' && (
              <View style={styles.expandableContent}>
                <Text style={styles.descriptionText}>
                  {product.description || 'Producto elaborado con materiales orgánicos de alta calidad.'}
                </Text>

                {product.material && (
                  <View style={styles.materialContainer}>
                    <Text style={styles.materialLabel}>Material</Text>
                    <Text style={styles.materialText}>{product.material}</Text>
                  </View>
                )}
                
                <View style={styles.characteristicsContainer}>
                  <Text style={styles.characteristicsTitle}>Características</Text>
                  <Text style={styles.characteristicItem}>• Material 100% orgánico certificado</Text>
                  <Text style={styles.characteristicItem}>• Libre de químicos nocivos</Text>
                  <Text style={styles.characteristicItem}>• Resistente al lavado</Text>
                  <Text style={styles.characteristicItem}>• Tinte natural sin productos químicos</Text>
                  <Text style={styles.characteristicItem}>• Comercio justo y ético</Text>
                </View>
              </View>
            )}

            {/* Cuidados de la Prenda */}
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => toggleSection('care')}
            >
              <Text style={styles.expandableTitle}>Cuidados de la Prenda</Text>
              <Ionicons
                name={expandedSection === 'care' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            {expandedSection === 'care' && (
              <View style={styles.expandableContent}>
                <Text style={styles.careItem}>• Lavar en agua fría</Text>
                <Text style={styles.careItem}>• Usar detergente suave y biodegradable</Text>
                <Text style={styles.careItem}>• No usar blanqueador</Text>
                <Text style={styles.careItem}>• Secar al aire libre cuando sea posible</Text>
              </View>
            )}
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="car-outline" size={32} color={GREEN} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Envío Gratis</Text>
                <Text style={styles.benefitSubtitle}>en compras +$100</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark-outline" size={32} color={GREEN} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Garantía</Text>
                <Text style={styles.benefitSubtitle}>30 días</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="repeat-outline" size={32} color={GREEN} />
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Cambios</Text>
                <Text style={styles.benefitSubtitle}>Sin costo</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Añadir a la cesta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: GREEN,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  ecoBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: GREEN,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  viewAllLink: {
    marginBottom: 24,
  },
  viewAllText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
  },
  materialContainer: {
    marginBottom: 16,
  },
  materialLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  materialText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    marginTop: 16,
  },
  benefitItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  benefitTextContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  benefitSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sizeGuideText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
  },
  sizesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sizeButtonSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  sizeButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  sizeTextDisabled: {
    color: '#9CA3AF',
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: GREEN,
    borderWidth: 3,
  },
  colorButtonWhite: {
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  expandableContainer: {
    marginTop: 8,
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  expandableContent: {
    paddingVertical: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  characteristicsContainer: {
    marginTop: 0,
  },
  characteristicsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  characteristicItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
  careItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  addToFavoritesButton: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToFavoritesText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
