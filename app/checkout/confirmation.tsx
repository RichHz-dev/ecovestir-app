import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StepIndicator from '../../components/step-indicator';
import { clearConfirmationPayload, getConfirmationPayload } from '../lib/checkoutStore';

const GREEN = '#00a63e';
const WHITE = '#fff';
const GRAY = '#9CA3AF';
const DARK_GRAY = '#374151';

export const options = { headerShown: false };

export default function ConfirmationScreen() {
  const router = useRouter();
  const payload = getConfirmationPayload() || {};
  const items = payload.items || [];
  const totals = payload.totals || { total: 0 };
  const shipping = payload.shippingData || {};

  const subtotal = items.reduce((s: number, it: any) => s + ((it.price || 0) * (it.quantity || 1)), 0);
  const shippingCost = 0; // if available, use payload
  const tax = parseFloat((subtotal * 0.16).toFixed(2));
  const total = totals.total ?? parseFloat((subtotal + shippingCost + tax).toFixed(2));

  const handleContinue = () => {
    clearConfirmationPayload();
    router.replace('/');
  };

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Finalizar Compra</Text>
        <Text style={styles.subtitle}>Completa tu pedido de forma segura y rápida</Text>

        <StepIndicator currentStep={3} />

        <View style={styles.iconWrap}>
          <View style={styles.checkCircle}><Ionicons name="checkmark" size={28} color={WHITE} /></View>
        </View>

        <Text style={styles.confirmTitle}>¡Pedido Confirmado!</Text>
        <Text style={styles.confirmSub}>Gracias por tu compra. Recibirás un email con los detalles de tu pedido.</Text>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="document" size={16} color={GREEN} />
            <Text style={styles.cardHeader}>  Resumen del Pedido</Text>
          </View>

          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Envío</Text><Text style={styles.summaryValue}>Gratis</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>IVA (16%)</Text><Text style={styles.summaryValue}>${tax.toFixed(2)}</Text></View>

          <View style={styles.summaryTotal}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>${total.toFixed(2)}</Text></View>

          <View style={styles.ecoBanner}><Ionicons name="leaf" size={14} color={GREEN} /><Text style={styles.ecoText}>  Tu compra ayuda al planeta. Usamos empaques 100% reciclables.</Text></View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar Comprando</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  container: { padding: 18, paddingTop: 36, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: DARK_GRAY },
  subtitle: { fontSize: 13, color: GRAY, marginBottom: 12 },
  iconWrap: { marginTop: 12, marginBottom: 12 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: DARK_GRAY, marginTop: 8 },
  confirmSub: { fontSize: 13, color: GRAY, textAlign: 'center', marginTop: 8, marginBottom: 16 },
  card: { width: '100%', backgroundColor: WHITE, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 18 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeader: { fontWeight: '700', color: DARK_GRAY },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { color: DARK_GRAY },
  summaryValue: { color: DARK_GRAY, fontWeight: '600' },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderColor: '#E5E7EB', marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: DARK_GRAY },
  totalValue: { fontSize: 16, fontWeight: '700', color: GREEN },
  ecoBanner: { backgroundColor: '#ECFDF5', borderRadius: 8, padding: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  ecoText: { color: GREEN, fontSize: 13, flex: 1 },
  continueButton: { backgroundColor: GREEN, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10, width: '100%' },
  continueButtonText: { color: WHITE, fontSize: 16, fontWeight: '700' },
});
