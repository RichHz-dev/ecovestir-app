import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepIndicator from '../components/step-indicator';
import { setCheckoutPayload } from './lib/checkoutStore';

// Colores
const GREEN = '#00a63e';
const WHITE = '#fff';
const GRAY = '#9CA3AF';
const DARK_GRAY = '#374151';

export const options = {
	headerShown: false,
};

export default function CheckoutScreen() {
	const router = useRouter();
	// auth is handled on the payment/confirmation step
	const { cart } = useCart();

	const [formData, setFormData] = useState({
		name: 'aaaa',
		lastName: 'aaaa',
		email: '',
		phone: '987654321',
		address: 'aaaaaa',
		city: 'asas',
		district: 'asas',
		postalCode: '12345',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saveInfo, setSaveInfo] = useState(false);

	const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express' | 'night'>('standard');

	// Calcular desde el carrito
	const subtotal = cart.reduce((sum, item) => {
		const price = typeof item.productId === 'object' ? (item.productId as any).price || 0 : 0;
		return sum + price * item.quantity;
	}, 0);
	const shippingCost = selectedShipping === 'standard' ? 0 : selectedShipping === 'express' ? 15 : 30;
	const tax = parseFloat((subtotal * 0.16).toFixed(2));
	const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

	const validateForm = () => {
		const e: Record<string, string> = {};

		// Names: letters, allow accents, spaces, apostrophes and dashes; minimum 2
		const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/;
		if (!nameRegex.test(formData.name.trim())) e.name = 'Nombre inválido (solo letras, mínimo 2)';
		if (!nameRegex.test(formData.lastName.trim())) e.lastName = 'Apellido inválido (solo letras, mínimo 2)';

		// Email
		const email = formData.email.trim();
		if (!email) e.email = 'El email es obligatorio';
		else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) e.email = 'Email inválido';
		}

		// Phone: exactly 9 digits
		const phone = formData.phone.trim();
		if (!/^[0-9]{9}$/.test(phone)) e.phone = 'Teléfono inválido (9 dígitos)';

		// Address: free text but minimum length
		if (!formData.address.trim() || formData.address.trim().length < 5) e.address = 'Dirección inválida (mínimo 5 caracteres)';

		// City / district: letters only
		const placeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/;
		if (!placeRegex.test(formData.city.trim())) e.city = 'Ciudad inválida (solo letras)';
		if (!placeRegex.test(formData.district.trim())) e.district = 'Distrito inválido (solo letras)';

		// Postal: exactly 5 digits
		const postal = formData.postalCode.trim();
		if (!/^[0-9]{5}$/.test(postal)) e.postalCode = 'Código postal inválido (5 dígitos)';

		return e;
	};

	const { user } = useAuth();

	useEffect(() => {
		// Auto-fill from authenticated user or previous checkout email
		(async () => {
			try {
				if (user?.email && user.email !== formData.email) {
					setFormData((prev) => ({ ...prev, email: user.email }));
					return;
				}

				const saved = await AsyncStorage.getItem('checkoutEmail');
				if (saved && saved !== formData.email) {
					setFormData((prev) => ({ ...prev, email: saved }));
				}
			} catch (err) {
				console.warn('checkout autofill error', err);
			}
		})();
		// only run when auth changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const handleContinue = async () => {
		const fieldErrors = validateForm();
		if (Object.keys(fieldErrors).length > 0) {
			// Log detailed errors for debugging and show a general alert
			console.warn('Validación de checkout:', fieldErrors);
			setErrors(fieldErrors);
			Alert.alert('Información de envío inválida', 'Revisa los campos del formulario e intenta nuevamente.');
			return;
		}
		// clear previous errors
		setErrors({});

		try {
			// persist or remove email depending on checkbox
			if (saveInfo && formData.email) {
				await AsyncStorage.setItem('checkoutEmail', formData.email);
			} else if (!saveInfo) {
				await AsyncStorage.removeItem('checkoutEmail');
			}
		} catch (err) {
			console.warn('checkout save email error', err);
		}

		// Store payload in-memory and navigate to payment screen
		setCheckoutPayload({ formData, selectedShipping, total });
		router.push('/checkout/payment');
	};

	return (
		<SafeAreaView style={styles.safe}>
			<ScrollView contentContainerStyle={styles.container}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color="#1F2937" />
					</TouchableOpacity>
				</View>
				<View style={styles.headerTitleWrap}>
					<Text style={styles.title}>Finalizar Compra</Text>
					<Text style={styles.subtitle}>Completa tu pedido de forma segura y rápida</Text>
				</View>
				<StepIndicator currentStep={1} />
				{Object.keys(errors).length > 0 ? (
					<View style={styles.formErrorBanner}>
						<Text style={styles.formErrorTitle}>Información de envío inválida</Text>
						<Text style={styles.formErrorText}>Corrige los campos resaltados en rojo.</Text>
					</View>
				) : null}

				{/* Shipping Info */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.checkBadge}>
							<Ionicons name="checkmark" size={12} color={GREEN} />
						</View>
						<Text style={styles.sectionTitle}>Información de Envío</Text>
					</View>
					<Text style={styles.sectionSubtitle}>Ingresá la dirección donde deseas recibir tu pedido</Text>

					<View style={styles.formRow}>
						<View style={styles.formField}>
							<Text style={styles.label}>Nombre *</Text>
							<TextInput
								style={styles.input}
								value={formData.name}
								onChangeText={(text) => {
									// allow letters, accents, spaces, apostrophes and dashes
									const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
									setFormData(prev => ({ ...prev, name: cleaned }));
									setErrors(prev => { const c = { ...prev }; delete c.name; return c; });
								}}
								placeholder="Tu nombre"
								autoCapitalize="words"
								placeholderTextColor={GRAY}
							/>
							{errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
						</View>
						<View style={styles.formField}>
							<Text style={styles.label}>Apellido *</Text>
							<TextInput
								style={styles.input}
								value={formData.lastName}
								onChangeText={(text) => {
									const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
									setFormData(prev => ({ ...prev, lastName: cleaned }));
									setErrors(prev => { const c = { ...prev }; delete c.lastName; return c; });
								}}
								placeholder="Tu apellido"
								autoCapitalize="words"
								placeholderTextColor={GRAY}
							/>
							{errors.lastName ? <Text style={styles.fieldError}>{errors.lastName}</Text> : null}
						</View>
					</View>

					<View style={styles.formRow}>
						<View style={styles.formField}>
							<Text style={styles.label}>Email *</Text>
							<TextInput
								style={styles.input}
								value={formData.email}
								onChangeText={(text) => { setFormData(prev => ({ ...prev, email: text })); setErrors(prev => { const c = { ...prev }; delete c.email; return c; }); }}
								placeholder="tu@email.com"
								keyboardType="email-address"
								autoCapitalize="none"
								placeholderTextColor={GRAY}
							/>
							{errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
						</View>
						<View style={styles.formField}>
							<Text style={styles.label}>Teléfono *</Text>
							<TextInput
								style={styles.input}
								value={formData.phone}
								onChangeText={(text) => {
									// allow only digits, limit to 9
									const cleaned = text.replace(/\D/g, '').slice(0, 9);
									setFormData(prev => ({ ...prev, phone: cleaned }));
									setErrors(prev => { const c = { ...prev }; delete c.phone; return c; });
								}}
								placeholder="Tu teléfono"
								keyboardType="phone-pad"
								maxLength={9}
								placeholderTextColor={GRAY}
							/>
							{errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
						</View>
					</View>

					<View style={styles.formField}>
						<Text style={styles.label}>Dirección *</Text>
						<TextInput
							style={styles.input}
							value={formData.address}
							onChangeText={(text) => { setFormData(prev => ({ ...prev, address: text })); setErrors(prev => { const c = { ...prev }; delete c.address; return c; }); }}
							placeholder="Calle, número, departamento..."
							autoCapitalize="sentences"
							placeholderTextColor={GRAY}
						/>
						{errors.address ? <Text style={styles.fieldError}>{errors.address}</Text> : null}
					</View>

					<View style={[styles.formRow, { marginTop: 8 }]}>
						<View style={styles.formField}>
							<Text style={styles.label}>Ciudad *</Text>
							<TextInput
								style={styles.input}
								value={formData.city}
								onChangeText={(text) => {
									const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
									setFormData(prev => ({ ...prev, city: cleaned }));
									setErrors(prev => { const c = { ...prev }; delete c.city; return c; });
								}}
								placeholder="Tu ciudad"
								autoCapitalize="words"
								placeholderTextColor={GRAY}
							/>
							{errors.city ? <Text style={styles.fieldError}>{errors.city}</Text> : null}
						</View>
						<View style={styles.formField}>
							<Text style={styles.label}>Distrito *</Text>
							<TextInput
								style={styles.input}
								value={formData.district}
								onChangeText={(text) => {
									const cleaned = text.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
									setFormData(prev => ({ ...prev, district: cleaned }));
									setErrors(prev => { const c = { ...prev }; delete c.district; return c; });
								}}
								placeholder="Tu distrito"
								autoCapitalize="words"
								placeholderTextColor={GRAY}
							/>
							{errors.district ? <Text style={styles.fieldError}>{errors.district}</Text> : null}
						</View>
					</View>

					<View style={styles.formField}>
						<Text style={styles.label}>Código Postal *</Text>
						<TextInput
							style={styles.input}
							value={formData.postalCode}
							onChangeText={(text) => {
								const cleaned = text.replace(/\D/g, '').slice(0, 5);
								setFormData(prev => ({ ...prev, postalCode: cleaned }));
								setErrors(prev => { const c = { ...prev }; delete c.postalCode; return c; });
							}}
							placeholder="Tu código postal"
							keyboardType="numeric"
							maxLength={5}
							placeholderTextColor={GRAY}
						/>
						{errors.postalCode ? <Text style={styles.fieldError}>{errors.postalCode}</Text> : null}
					</View>

					<View style={styles.saveInfoRow}>
						<TouchableOpacity onPress={() => setSaveInfo(prev => !prev)}>
							{saveInfo ? (
								<View style={styles.checkboxChecked}><Ionicons name="checkmark" size={14} color="#fff" /></View>
							) : (
								<View style={styles.checkboxEmpty} />
							)}
						</TouchableOpacity>
						<Text style={styles.saveInfoText}>Guardar esta información para futuras compras</Text>
					</View>
				</View>

				{/* Shipping Method */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.checkBadge}>
							<Ionicons name="checkmark" size={12} color={GREEN} />
						</View>
						<Text style={styles.sectionTitle}>Método de Envío</Text>
					</View>
					<Text style={styles.sectionSubtitle}>Elije cómo deseas recibir tu pedido</Text>

					<View style={styles.shippingOptions}>
						<TouchableOpacity style={[styles.shippingOption, selectedShipping === 'standard' && styles.shippingOptionSelected]} onPress={() => setSelectedShipping('standard')}>
							<View style={styles.shippingOptionLeft}>
								<View style={styles.selectorContainer}>{selectedShipping === 'standard' ? (<View style={styles.selectorOuter}><View style={styles.selectorDot} /></View>) : (<View style={styles.selectorEmpty} />)}</View>
								<View style={styles.shippingIcon}><Ionicons name="car" size={20} color={selectedShipping === 'standard' ? GREEN : DARK_GRAY} /></View>
								<View style={styles.shippingText}><Text style={styles.shippingTitle}>Envío Estándar</Text><Text style={styles.shippingDetail}>5-7 días hábiles</Text></View>
							</View>
							<Text style={[styles.shippingPrice, selectedShipping === 'standard' && styles.shippingPriceSelected]}>Gratis</Text>
						</TouchableOpacity>

						<TouchableOpacity style={[styles.shippingOption, selectedShipping === 'express' && styles.shippingOptionSelected]} onPress={() => setSelectedShipping('express')}>
							<View style={styles.shippingOptionLeft}>
								<View style={styles.selectorContainer}>{selectedShipping === 'express' ? (<View style={styles.selectorOuter}><View style={styles.selectorDot} /></View>) : (<View style={styles.selectorEmpty} />)}</View>
								<View style={styles.shippingIcon}><Ionicons name="flash" size={20} color={selectedShipping === 'express' ? GREEN : DARK_GRAY} /></View>
								<View style={styles.shippingText}><Text style={styles.shippingTitle}>Envío Express</Text><Text style={styles.shippingDetail}>2-3 días hábiles</Text></View>
							</View>
							<Text style={[styles.shippingPrice, selectedShipping === 'express' && styles.shippingPriceSelected]}>$15</Text>
						</TouchableOpacity>

						<TouchableOpacity style={[styles.shippingOption, selectedShipping === 'night' && styles.shippingOptionSelected]} onPress={() => setSelectedShipping('night')}>
							<View style={styles.shippingOptionLeft}>
								<View style={styles.selectorContainer}>{selectedShipping === 'night' ? (<View style={styles.selectorOuter}><View style={styles.selectorDot} /></View>) : (<View style={styles.selectorEmpty} />)}</View>
								<View style={styles.shippingIcon}><Ionicons name="moon" size={20} color={selectedShipping === 'night' ? GREEN : DARK_GRAY} /></View>
								<View style={styles.shippingText}><Text style={styles.shippingTitle}>Envío Nocturno</Text><Text style={styles.shippingDetail}>1 día hábil</Text></View>
							</View>
							<Text style={[styles.shippingPrice, selectedShipping === 'night' && styles.shippingPriceSelected]}>$30</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Order Summary */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.checkBadgeAlt}><Ionicons name="checkmark" size={12} color={GREEN} /></View>
						<Text style={styles.sectionTitle}>Resumen del Pedido</Text>
						<TouchableOpacity onPress={() => router.push('/cart')} style={styles.editCartBtn}><Text style={styles.editCartText}>Editar</Text></TouchableOpacity>
					</View>

					{cart && cart.length > 0 ? (
						cart.map((it, idx) => {
							const prod = typeof it.productId === 'object' ? (it.productId as any) : null;
							const imageUri = prod && prod.images && prod.images.length > 0 ? prod.images[0] : 'https://via.placeholder.com/60?text=Producto';
							const name = prod?.name || 'Producto';
							const size = it.size || prod?.sizes?.[0] || '';
							const quantity = it.quantity || 1;
							const price = (prod?.price ?? 0) * quantity;
							const key = (it as any)._id || prod?._id || String(idx);

							return (
								<View style={styles.productSummary} key={key}>
									<Image source={{ uri: imageUri }} style={styles.productImage} />
									<View style={styles.productDetails}>
										<Text style={styles.productName}>{name}</Text>
										<Text style={styles.productInfo}>{size}{size ? ', ' : ''}Cantidad: {quantity}</Text>
									</View>
									<Text style={styles.productPrice}>${price.toFixed(2)}</Text>
								</View>
							);
						})
					) : (
						<View style={styles.productSummary}>
							<Image source={{ uri: 'https://via.placeholder.com/60?text=Camiseta' }} style={styles.productImage} />
							<View style={styles.productDetails}>
								<Text style={styles.productName}>Camiseta Estampada Eco</Text>
								<Text style={styles.productInfo}>Talla M, Cantidad: 1</Text>
							</View>
							<Text style={styles.productPrice}>$29.99</Text>
						</View>
					)}

					<View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text></View>
					<View style={styles.summaryRow}><Text style={styles.summaryLabel}>Envío</Text><Text style={styles.summaryValue}>{shippingCost === 0 ? 'Gratis' : `$${shippingCost}`}</Text></View>
					<View style={styles.summaryRow}><Text style={styles.summaryLabel}>IVA (16%)</Text><Text style={styles.summaryValue}>${tax.toFixed(2)}</Text></View>
					<View style={styles.summaryTotal}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>${total.toFixed(2)}</Text></View>

					<View style={styles.ecoBanner}><View style={styles.ecoIcon}><Ionicons name="leaf" size={14} color={GREEN} /></View><Text style={styles.ecoText}>Tu compra ayuda al planeta. Usamos empaques 100% reciclables.</Text></View>
				</View>

				<TouchableOpacity style={[styles.continueButton]} onPress={handleContinue}>
					<Text style={styles.continueButtonText}>Continuar al Pago</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: WHITE },
	container: { paddingHorizontal: 16, paddingBottom: 40 },
	headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
	backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
	headerTitleWrap: { marginLeft: 10, marginBottom: 8 },
	title: { fontSize: 24, fontWeight: 'bold', color: DARK_GRAY, marginBottom: 4 },
	subtitle: { fontSize: 14, color: GRAY },
	steps: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
	step: { flexDirection: 'column', alignItems: 'center', flex: 1 },
	stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
	stepActive: { backgroundColor: GREEN },
	stepNumber: { color: WHITE, fontWeight: 'bold', fontSize: 14 },
	stepNumberActive: { color: WHITE, fontWeight: 'bold', fontSize: 14 },
	stepNumberInactive: { color: GRAY, fontWeight: 'bold', fontSize: 14 },
	stepLabel: { fontSize: 12, color: GRAY, marginTop: 4 },
	stepActiveLabel: { color: GREEN, fontWeight: '700' },
	stepSeparator: { width: 20, borderBottomWidth: 1, borderColor: '#D1D5DB' },
	section: { backgroundColor: WHITE, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 },
	sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: DARK_GRAY, marginLeft: 8 },
	sectionSubtitle: { fontSize: 13, color: GRAY, marginBottom: 16 },
	formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
	formField: { flex: 1 },
	label: { fontSize: 13, fontWeight: '600', color: DARK_GRAY, marginBottom: 4 },
	input: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: DARK_GRAY, borderWidth: 1, borderColor: '#E5E7EB' },
	saveInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
	checkboxEmpty: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: GRAY },
	saveInfoText: { fontSize: 14, color: DARK_GRAY, marginLeft: 8 },
	shippingOptions: { marginTop: 8 },
	checkBadge: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: GREEN, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
	checkBadgeAlt: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: GREEN, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
	shippingOption: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	shippingOptionSelected: { backgroundColor: '#ECFDF5', borderColor: GREEN },
	shippingOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
	selectorContainer: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
	selectorEmpty: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: GRAY, backgroundColor: WHITE },
	selectorOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: GREEN, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
	selectorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
	shippingIcon: { marginRight: 12 },
	shippingText: { flex: 1 },
	shippingTitle: { fontSize: 16, fontWeight: '600', color: DARK_GRAY },
	shippingDetail: { fontSize: 13, color: GRAY, marginTop: 2 },
	shippingPrice: { fontSize: 16, fontWeight: 'bold', color: DARK_GRAY, alignSelf: 'center' },
	shippingPriceSelected: { color: GREEN },
	productSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
	productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
	productDetails: { flex: 1 },
	productName: { fontSize: 16, fontWeight: '600', color: DARK_GRAY },
	productInfo: { fontSize: 13, color: GRAY, marginTop: 2 },
	productPrice: { fontSize: 16, fontWeight: 'bold', color: DARK_GRAY },
	summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#E5E7EB' },
	summaryLabel: { fontSize: 14, color: DARK_GRAY },
	summaryValue: { fontSize: 14, fontWeight: '600', color: DARK_GRAY },
	summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 2, borderColor: '#E5E7EB' },
	totalLabel: { fontSize: 16, fontWeight: 'bold', color: DARK_GRAY },
	totalValue: { fontSize: 18, fontWeight: 'bold', color: GREEN },
	ecoBanner: { backgroundColor: '#ECFDF5', borderRadius: 8, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 6 },
	ecoIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
	ecoText: { fontSize: 13, color: GREEN, textAlign: 'justify', flex: 1, flexWrap: 'wrap', flexShrink: 1 },
	editCartBtn: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
	editCartText: { color: GREEN, fontWeight: '600', fontSize: 13 },
	continueButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 16, alignItems: 'center', width: '100%', marginTop: 20 },
	continueButtonText: { color: WHITE, fontSize: 18, fontWeight: 'bold' },
	fieldError: { color: '#DC2626', marginTop: 6, fontSize: 13 },
	formErrorBanner: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10, marginVertical: 12 },
	formErrorTitle: { color: '#991B1B', fontWeight: '700', marginBottom: 4 },
	formErrorText: { color: '#991B1B', fontSize: 13 },
	checkboxChecked: { width: 20, height: 20, borderRadius: 4, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
});
