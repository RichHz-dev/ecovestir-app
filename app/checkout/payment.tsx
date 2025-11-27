import { useCart } from '@/context/CartContext';
import * as api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StepIndicator from '../../components/step-indicator';
import { clearCheckoutPayload, getCheckoutPayload, setConfirmationPayload } from '../lib/checkoutStore';

const GREEN = '#00a63e';
const WHITE = '#fff';
const GRAY = '#9CA3AF';
const DARK_GRAY = '#374151';

export const options = {
  headerShown: false,
};

export default function PaymentScreen() {
  const router = useRouter();
  const { cart, clearCartItems } = useCart();
  const [loading, setLoading] = useState(false);

  // Read payload from the in-memory store (set by checkout screen)
  let parsed: any = getCheckoutPayload();
  if (!parsed) {
    try {
      // Fallback: try reading from global location (if someone used query param)
      // Not using useSearchParams because it may be undefined in some environments.
      const q = typeof window !== 'undefined' ? window.location.search : '';
      if (q && q.includes('data=')) {
        const match = q.match(/data=([^&]+)/);
        if (match && match[1]) {
          parsed = JSON.parse(decodeURIComponent(match[1]));
        }
      }
    } catch (e) {
      console.warn('Invalid payment params fallback', e);
    }
  }

  const handleConfirm = async () => {
    if (!parsed) {
      Alert.alert('Error', 'Datos de pago inválidos. Vuelve atrás y completa la información.');
      return;
    }

    if (!cart || cart.length === 0) {
      Alert.alert('Carrito vacío', 'Tu carrito está vacío.');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map((it: any) => {
        const prod = typeof it.productId === 'object' ? it.productId : { _id: it.productId };
        return {
          productId: prod._id,
          name: prod.name || '',
          price: prod.price || 0,
          quantity: it.quantity,
          size: it.size || '',
        };
      });

      const body = {
        paymentInfo: {
          shippingData: {
            firstName: parsed.formData.name,
            lastName: parsed.formData.lastName,
            email: parsed.formData.email,
            phone: parsed.formData.phone,
            address: parsed.formData.address,
            city: parsed.formData.city,
            state: parsed.formData.district,
            zipCode: parsed.formData.postalCode,
          },
          shippingMethod: parsed.selectedShipping,
        },
        items,
        total: parsed.total ?? 0,
      };

      const resp = await api.createOrder(body);
      // prepare confirmation payload (use backend response if available)
      const confirmation = {
        order: resp || null,
        items,
        totals: { total: parsed.total ?? 0 },
        shippingData: parsed.formData,
      };
      setConfirmationPayload(confirmation);
      await clearCartItems();
      Alert.alert('Orden creada', 'Tu pedido se creó correctamente.');
      router.replace('/checkout/confirmation');
    } catch (err: any) {
      console.error('Payment confirm error', err);
      Alert.alert('Error', err?.message || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Método de Pago</Text>
          <Text style={styles.subtitle}>Confirma tu pedido y método de pago</Text>
        </View>

        <StepIndicator currentStep={2} />

        <TouchableOpacity style={styles.editInfoRow} onPress={() => router.back()}>
          <Ionicons name="pencil" size={16} color={GREEN} />
          <Text style={styles.editInfoText}>Editar información de envío</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Método de Pago</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>El pago se procesará automáticamente</Text>
            <Text style={styles.infoText}>Próximamente: integración de una pasarela de pago</Text>
          </View>
        </View>
        

        <TouchableOpacity style={[styles.confirmButton, loading ? { opacity: 0.6 } : null]} onPress={handleConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirmar Pedido</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  container: { padding: 16, paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  title: { fontSize: 22, fontWeight: '700', color: DARK_GRAY, marginTop: 8, marginBottom: 12 },
  section: { backgroundColor: '#FFF9EB', borderRadius: 10, padding: 12, marginBottom: 12, borderColor: '#FDE68A', borderWidth: 1 },
  infoTitle: { color: '#92400E', fontWeight: '700', marginBottom: 6 },
  infoText: { color: '#92400E', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK_GRAY },
  sectionSubtitle: { color: GRAY, marginTop: 6 },
  confirmButton: { backgroundColor: GREEN, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  confirmText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  editInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, marginTop: 12 },
  editInfoText: { color: GREEN, marginLeft: 8, fontWeight: '600' },
  card: { backgroundColor: WHITE, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoBox: { backgroundColor: '#FFF9EB', borderRadius: 8, padding: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  headerTitleWrap: { marginLeft: 10, marginBottom: 8 },
  subtitle: { fontSize: 14, color: GRAY },
});
