import { ProductCard } from '@/components/product-card';
import { useCart } from '@/context/CartContext';
import { getCategories, getProducts, isUserLoggedIn } from '@/services/api';
import { Category, Product } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#00a63e';

export default function ProductsScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [materialsList, setMaterialsList] = useState<string[]>([]);
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 200, materials: [] as string[], sizes: [] as string[], ecoOnly: false as boolean });
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories({ limit: 20, isActive: true });
        setCategories(data.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Load materials list from backend (fetch more products) once
  useEffect(() => {
    let mounted = true;
    const loadMaterials = async () => {
      try {
        const res = await getProducts({ limit: 1000 });
        const data = res.data || [];
        const mset = new Map<string, string>();
        (data || []).forEach((p: any) => {
          const raw = p.material || p.materials || p.materialo || '';
          if (!raw) return;
          const key = String(raw).toLowerCase().trim();
          if (!mset.has(key)) mset.set(key, String(raw).trim());
        });
        if (mounted) setMaterialsList(Array.from(mset.values()));
      } catch (err) {
        console.error('Error loading materials for filters', err);
      }
    };
    loadMaterials();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params: any = { limit: 100 };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const data = await getProducts(params);
        let list = data.data || [];

        // Apply client-side filters: price, materials, sizes, ecoOnly
        list = list.filter((p: any) => {
          if (filters.ecoOnly && !p.ecoFriendly) return false;
          if (filters.materials && filters.materials.length > 0) {
            const raw = (p.material || p.materials || '').toString().toLowerCase();
            const ok = filters.materials.some((m: string) => raw.includes(m.toLowerCase()));
            if (!ok) return false;
          }
          if (filters.sizes && filters.sizes.length > 0) {
            const available = p.availableSizes || [];
            const ok = filters.sizes.some((s: string) => available.includes(s));
            if (!ok) return false;
          }
          if (typeof p.price === 'number') {
            if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
          }
          return true;
        });

        setProducts(list);
        setTotalProducts(list.length);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, searchQuery, filters]);

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        id={item._id}
        name={item.name}
        price={item.price}
        rating={item.rating}
        image={item.images && item.images[0] 
          ? { uri: item.images[0] } 
          : require('@/assets/images/react-logo.png')}
        isOrganic={item.ecoFriendly}
        onPress={() => router.push(`/product-detail?id=${item._id}`)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuestra Colección</Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleCartPress}
        >
          <Ionicons name="cart-outline" size={24} color="#1F2937" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en Ecovestir"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>

        {/* Filters Modal */}
        <Modal visible={showFilters} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={22} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Categorías</Text>
                  <View style={styles.chipsContainer}>
                    {categories.map((c) => (
                      <TouchableOpacity
                        key={c._id}
                        style={[styles.categoryChip, selectedCategory === c._id && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(selectedCategory === c._id ? null : c._id)}
                      >
                        <Text style={[styles.categoryChipText, selectedCategory === c._id && styles.categoryChipTextActive]}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Rango de Precio</Text>
                  <View style={styles.priceRow}>
                    <TextInput style={styles.priceInput} keyboardType="numeric" value={String(filters.minPrice)} onChangeText={(v) => setFilters({ ...filters, minPrice: Number(v) || 0 })} />
                    <Text style={styles.priceSeparator}>a</Text>
                    <TextInput style={styles.priceInput} keyboardType="numeric" value={String(filters.maxPrice)} onChangeText={(v) => setFilters({ ...filters, maxPrice: Number(v) || 200 })} />
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Materiales</Text>
                  <View style={styles.chipsContainer}>
                    {materialsList.length === 0 ? (
                      <Text style={{ color: '#6B7280' }}>Cargando...</Text>
                    ) : (
                      materialsList.map((m) => {
                        const selected = filters.materials.includes(m);
                        return (
                          <TouchableOpacity key={m} style={[styles.materialBtn, selected && styles.materialBtnActive]} onPress={() => {
                            const next = selected ? filters.materials.filter(x => x !== m) : [...filters.materials, m];
                            setFilters({ ...filters, materials: next });
                          }}>
                            <Text style={[{ fontSize: 13 }, selected ? { color: '#fff' } : { color: '#374151' }]}>{m}</Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Tallas</Text>
                  <View style={styles.chipsContainerInline}>
                    {['S','M','L','XL'].map((s) => {
                      const sel = filters.sizes.includes(s);
                      return (
                        <TouchableOpacity key={s} style={[styles.sizeBtn, sel && styles.sizeBtnActive]} onPress={() => {
                          const next = sel ? filters.sizes.filter(x => x !== s) : [...filters.sizes, s];
                          setFilters({ ...filters, sizes: next });
                        }}>
                          <Text style={sel ? { color: '#fff' } : { color: '#374151' }}>{s}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalSectionRow}>
                  <Text style={styles.modalLabel}>Solo eco-friendly</Text>
                  <Switch value={filters.ecoOnly} onValueChange={(v) => setFilters({ ...filters, ecoOnly: v })} thumbColor={filters.ecoOnly ? GREEN : '#fff'} trackColor={{ true: '#A7F3D0', false: '#E5E7EB' }} />
                </View>

                <View style={styles.footerRow}>
                  <TouchableOpacity style={styles.clearBtn} onPress={() => setFilters({ minPrice: 0, maxPrice: 200, materials: [], sizes: [], ecoOnly: false })}>
                    <Text style={{ color: GREEN }}>Limpiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.applyBtn} onPress={() => { setShowFilters(false); /* filters state already set */ }}>
                    <Text style={{ color: '#FFFFFF' }}>Aplicar</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.categoriesScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item._id && styles.categoryChipActive,
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === item._id ? null : item._id)
              }
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item._id && styles.categoryChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          Mostrando {products.length} de {totalProducts} productos
        </Text>
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shirt-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No se encontraron productos</Text>
            </View>
          }
        />
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
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -4,
    backgroundColor: GREEN,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  productCardWrapper: {
    width: '48%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  modalSection: { marginTop: 12 },
  modalLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  priceInput: { width: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 8, color: '#1F2937' },
  modalSectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  clearBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  applyBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  /* new layout helpers for modal */
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 },
  chipsContainerInline: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceSeparator: { marginHorizontal: 8, color: '#6B7280' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  categoryChipText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  categoryChipTextActive: { color: '#FFFFFF' },
  materialBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 8, marginBottom: 8 },
  materialBtnActive: { backgroundColor: GREEN },
  sizeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 },
  sizeBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
});
