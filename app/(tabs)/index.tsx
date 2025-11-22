import { CategoryCard } from '@/components/category-card';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProducts } from '@/services/api';
import { Category, Product } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const GREEN = '#00a63e';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar productos y categorías en paralelo
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ limit: 6, sort: '-rating' }), // Top 6 productos mejor calificados
        getCategories({ limit: 4, isActive: true }) // Top 4 categorías activas
      ]);

      setProducts(productsData.data);
      setCategories(categoriesData.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('@/assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Ecovestir</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
            <Ionicons name="cart-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="person-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Ropa Orgánica Para un Futuro Sostenible</Text>
          <Text style={styles.heroDescription}>
            Descubre nuestra colección de ropa fabricada con materiales 100% orgánicos. Y recuerda,
            nuestro salario debe ser tu Vida, ¡Viste mejor!
          </Text>
          <View style={styles.heroBadge}>
            <Ionicons name="checkmark-circle" size={18} color={GREEN} />
            <Text style={styles.heroBadgeText}>Algodón orgánico certificado</Text>
          </View>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.heroButtonText}>Explorar Colección</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroButtonOutline}>
            <Text style={styles.heroButtonOutlineText}>Conoce Más</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6+</Text>
            <Text style={styles.statLabel}>Años en{'\n'}Existencia</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50,000+</Text>
            <Text style={styles.statLabel}>Clientes{'\n'}Felices</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Productos{'\n'}Orgánicos</Text>
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <Text style={styles.sectionSubtitle}>
            Nuestra selección de prendas orgánicas más populares.
          </Text>
          {products.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.productsScroll}
              contentContainerStyle={styles.productsScrollContent}
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  name={product.name}
                  price={product.price}
                  rating={product.rating}
                  image={product.images && product.images[0] 
                    ? { uri: product.images[0] } 
                    : require('@/assets/images/react-logo.png')}
                  isOrganic={product.ecoFriendly}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
          )}
        </View>

        {/* View All Button */}
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/products')}
        >
          <Text style={styles.viewAllButtonText}>Ver Todos los Productos</Text>
        </TouchableOpacity>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Nuestras Categorías</Text>
              <Text style={styles.sectionSubtitle}>
                Explora nuestra amplia gama de categorías de ropa orgánica.
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {categories.length > 0 ? (
            categories.slice(0, 3).map((category) => (
              <CategoryCard
                key={category._id}
                title={category.name}
                image={category.image && category.image !== 'https://via.placeholder.com/400x400?text=Sin+Imagen'
                  ? { uri: category.image }
                  : require('@/assets/images/react-logo.png')}
                onPress={() => router.push(`/products?category=${category._id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No hay categorías disponibles</Text>
          )}
        </View>

        {/* Why Choose Organic */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>¿Por Qué Elegir Ropa Orgánica?</Text>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="leaf" size={28} color={GREEN} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Mejor para tu Piel</Text>
              <Text style={styles.benefitDescription}>
                Los materiales orgánicos son más suaves y no contienen químicos que pueden irritar
                tu piel sensible.
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="earth" size={28} color={GREEN} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Amigable con el Medio Ambiente</Text>
              <Text style={styles.benefitDescription}>
                La producción orgánica utiliza menos agua y no contamina el suelo con pesticidas
                nocivos.
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="people" size={28} color={GREEN} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Comercio Justo</Text>
              <Text style={styles.benefitDescription}>
                Apoyamos a los agricultores y trabajadores con condiciones laborales justas y
                salarios dignos.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
        </>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 44,
    height: 44,
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: GREEN,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  heroDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
    marginLeft: 6,
  },
  heroButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 25,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  heroButtonOutline: {
    borderWidth: 2,
    borderColor: GREEN,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  heroButtonOutlineText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: '700',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  seeAllText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
    marginTop: 4,
  },
  productsScroll: {
    marginHorizontal: -24,
  },
  productsScrollContent: {
    paddingHorizontal: 24,
  },
  viewAllButton: {
    backgroundColor: GREEN,
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  benefitsSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: GREEN,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    paddingVertical: 20,
  },
});
