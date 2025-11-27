import { CategoryCard } from '@/components/category-card';
import { ProductCard } from '@/components/product-card';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getCategories, getProducts, isUserLoggedIn } from '@/services/api';
import { Category, Product } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const GREEN = '#00a63e';
const CARD_WIDTH = 180;
const CARD_MARGIN = 12;

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleCartPress = async () => {
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para ver tu carrito',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a Login', onPress: () => router.push('/login') }
        ]
      );
      return;
    }
    router.push('/cart');
  };

  const handleAvatarPress = () => {
    if (user) {
      setShowUserMenu(true);
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const data = await getProducts({ q: query, limit: 20 });
      setSearchResults(data.data);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchModalClose = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  useEffect(() => {
    loadData();
  }, []);

  // Auto-scroll para productos
  useEffect(() => {
    if (products.length <= 1) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % products.length;
      scrollViewRef.current?.scrollTo({
        x: currentIndex * (CARD_WIDTH + CARD_MARGIN),
        animated: true,
      });
    }, 2000); // Cambiar cada 2 segundos

    return () => clearInterval(interval);
  }, [products.length]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar productos y categorías en paralelo
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ limit: 4, sort: '-rating' }), // Top 4 productos mejor calificados
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
      
      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenuContainer}>
            <View style={styles.userMenuHeader}>
              <View style={styles.userMenuAvatar}>
                <Text style={styles.userMenuAvatarText}>
                  {user?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userMenuInfo}>
                <Text style={styles.userMenuName}>
                  Hola {user ? user.name.charAt(0).toUpperCase() + user.name.slice(1).toLowerCase() : ''}
                </Text>
                <Text style={styles.userMenuEmail}>{user?.email}</Text>
              </View>
            </View>
            
            <View style={styles.userMenuDivider} />
            
            <TouchableOpacity 
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push('/contact');
              }}
            >
              <Ionicons name="mail-outline" size={20} color={GREEN} />
              <Text style={styles.userMenuItemTextGreen}>Contacto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push('/reviews');
              }}
            >
              <Ionicons name="star-outline" size={20} color="#FBBF24" />
              <Text style={styles.userMenuItemTextYellow}>Reseñas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.userMenuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.userMenuItemTextDanger}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={handleSearchModalClose}
      >
        <View style={styles.searchModalContainer}>
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={handleSearchModalClose}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results */}
          <ScrollView style={styles.searchResults}>
            {searching ? (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="large" color={GREEN} />
                <Text style={styles.searchingText}>Buscando...</Text>
              </View>
            ) : searchQuery.length < 2 ? (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.searchEmptyText}>Escribe al menos 2 caracteres para buscar</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="sad-outline" size={64} color="#D1D5DB" />
                <Text style={styles.searchEmptyText}>No se encontraron productos</Text>
                <Text style={styles.searchEmptySubtext}>Intenta con otros términos</Text>
              </View>
            ) : (
              <View style={styles.searchResultsList}>
                <Text style={styles.searchResultsCount}>
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                </Text>
                {searchResults.map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      handleSearchModalClose();
                      router.push(`/product-detail?id=${product._id}`);
                    }}
                  >
                    <Image
                      source={
                        product.images && product.images[0]
                          ? { uri: product.images[0] }
                          : require('@/assets/images/react-logo.png')
                      }
                      style={styles.searchResultImage}
                    />
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.searchResultPrice}>€{product.price.toFixed(2)}</Text>
                      {product.ecoFriendly && (
                        <View style={styles.searchResultBadge}>
                          <Ionicons name="leaf-outline" size={12} color={GREEN} />
                          <Text style={styles.searchResultBadgeText}>Orgánico</Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      
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
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Ionicons name="search-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleCartPress}
          >
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
            <Ionicons name="cart-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleAvatarPress}
          >
            {user ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            ) : (
              <Ionicons name="person-outline" size={24} color="#1F2937" />
            )}
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
            nuestro sello siempre sera ¡Viste bien. Viste mejor!
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
          <TouchableOpacity 
            style={styles.heroButtonOutline}
            onPress={() => router.push('/about')}
          >
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
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.productsScroll}
              contentContainerStyle={styles.productsScrollContent}
              pagingEnabled={false}
              decelerationRate="fast"
            >
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  rating={product.rating}
                  image={product.images && product.images[0] 
                    ? { uri: product.images[0] } 
                    : require('@/assets/images/react-logo.png')}
                  isOrganic={product.ecoFriendly}
                  onPress={() => router.push(`/product-detail?id=${product._id}`)}
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
          <View>
            <Text style={styles.sectionTitle}>Nuestras Categorías</Text>
            <Text style={styles.sectionSubtitle}>
              Explora nuestra amplia gama de categorías de ropa orgánica.
            </Text>
          </View>
          {categories.length > 0 ? (
            <>
              {categories.slice(0, 3).map((category) => (
                <CategoryCard
                  key={category._id}
                  title={category.name}
                  image={category.image && category.image !== 'https://via.placeholder.com/400x400?text=Sin+Imagen'
                    ? { uri: category.image }
                    : require('@/assets/images/react-logo.png')}
                  onPress={() => router.push(`/products?categoryId=${category._id}`)}
                />
              ))}
              <TouchableOpacity 
                style={styles.seeAllCategoriesButton}
                onPress={() => router.push('/categories')}
              >
                <Text style={styles.seeAllCategoriesText}>Ver Todas as Categorías</Text>
              </TouchableOpacity>
            </>
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
    paddingTop: 40,
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
    paddingVertical: 12,
    paddingHorizontal: 32,
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
    paddingVertical: 10,
    paddingHorizontal: 32,
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
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
    marginTop: 4,
  },
  seeAllCategoriesButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
  },
  seeAllCategoriesText: {
    fontSize: 15,
    color: GREEN,
    fontWeight: '700',
  },
  productsScroll: {
    marginHorizontal: -24,
  },
  productsScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  viewAllButton: {
    backgroundColor: GREEN,
    marginHorizontal: 'auto',
    marginBottom: 32,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
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
    fontSize: 15,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  userMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 60,
    marginRight: 16,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  userMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userMenuAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  userMenuInfo: {
    flex: 1,
  },
  userMenuName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  userMenuEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  userMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  userMenuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  userMenuItemTextGreen: {
    fontSize: 15,
    fontWeight: '600',
    color: GREEN,
  },
  userMenuItemTextYellow: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FBBF24',
  },
  userMenuItemTextDanger: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  searchResults: {
    flex: 1,
  },
  searchingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  searchingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  searchEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  searchEmptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  searchEmptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  searchResultPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 4,
  },
  searchResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchResultBadgeText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '500',
  },
});
