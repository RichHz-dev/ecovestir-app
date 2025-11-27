import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tenerlo instalado: expo install @expo/vector-icons
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import * as api from '@/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Colores
const GREEN = '#00a63e';
const WHITE = '#fff';
const GRAY = '#9CA3AF';
const DARK_GRAY = '#374151';
// const LIGHT_GRAY = '#f5f5f5';

export default function CheckoutScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const { cart, clearCartItems } = useCart();

	const [formData, setFormData] = useState({
		name: 'Ricardo',
		lastName: 'Huaman',
		email: 'ricardo@gmail.cor',
		phone: '982344564',
		address: 'calle ejemplo, av. los angeles',
		city: 'Lima',
		district: 'Ves',
		postalCode: '12345',
	});

	const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express' | 'night'>('standard');
	const [saveInfo, setSaveInfo] = useState(true);

	// Calcular desde el carrito
	const subtotal = cart.reduce((sum, item) => {
		const price = typeof item.productId === 'object' ? (item.productId as any).price || 0 : 0;
		return sum + price * item.quantity;
	}, 0);
	const shippingCost = selectedShipping === 'standard' ? 0 : selectedShipping === 'express' ? 15 : 30;
	const tax = parseFloat((subtotal * 0.16).toFixed(2));
	const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

	// Validación de campos
	const validateForm = () => {
		if (!formData.name.trim()) return 'El nombre es obligatorio';
		if (!formData.lastName.trim()) return 'El apellido es obligatorio';
		if (!formData.email.trim()) return 'El email es obligatorio';
		if (!formData.phone.trim()) return 'El teléfono es obligatorio';
		if (!formData.address.trim()) return 'La dirección es obligatoria';
		if (!formData.city.trim()) return 'La ciudad es obligatoria';
		if (!formData.district.trim()) return 'El distrito es obligatorio';
		if (!formData.postalCode.trim()) return 'El código postal es obligatorio';

		// Validación de email básica
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) return 'Email inválido';

		return null; // No hay errores
	};

	const [loading, setLoading] = useState(false);

	const handleContinue = async () => {
		const error = validateForm();
		if (error) {
			Alert.alert('Error', error);
			return;
		}

		if (!user) {
			Alert.alert('Debes iniciar sesión', 'Inicia sesión para poder completar la compra.');
			return;
		}

		if (!cart || cart.length === 0) {
			Alert.alert('Carrito vacío', 'Tu carrito está vacío. Agrega productos antes de continuar.');
			return;
		}

		setLoading(true);
		try {
			// Construir items respetando el esquema esperado por el backend
			const items = cart.map((it) => {
				const prod = typeof it.productId === 'object' ? (it.productId as any) : { _id: it.productId };
				return {
					productId: prod._id,
					name: prod.name || '',
					price: prod.price || 0,
					quantity: it.quantity,
					size: it.size || '',
				};
			});

			const shippingData = {
				firstName: formData.name,
				lastName: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				address: formData.address,
				city: formData.city,
				state: formData.district, // backend espera 'state'
				zipCode: formData.postalCode,
			};

			const body = {
				paymentInfo: {
					shippingData,
					shippingMethod: selectedShipping,
				},
				items,
				total,
			};

			await api.createOrder(body);
			// Limpia carrito en cliente y navegar a confirmación
			await clearCartItems();
			Alert.alert('Orden creada', 'Tu pedido se creó correctamente.');
			// si tienes una pantalla de confirmación, podrías navegar allí. Por ahora volvemos al home
			router.replace('/');
		} catch (err: any) {
			console.error('Checkout error:', err);
			const msg = err?.message || 'Error creando la orden';
			Alert.alert('Error', msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safe}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Custom Header (back button) */}
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color="#1F2937" />
					</TouchableOpacity>
				</View>
				{/* Title below the arrow, aligned under the back button */}
				<View style={styles.headerTitleWrap}>
					<Text style={styles.title}>Finalizar Compra</Text>
					<Text style={styles.subtitle}>Completa tu pedido de forma segura y rápida</Text>
				</View>

				{/* Progress Steps */}
				<View style={styles.steps}>
					<View style={styles.step}>
						<View style={[styles.stepCircle, styles.stepActive]}>
							<Text style={[styles.stepNumber, styles.stepNumberActive]}>1</Text>
						</View>
						<Text style={[styles.stepLabel, styles.stepActiveLabel]}>Envío</Text>
					</View>
					<View style={styles.stepSeparator} />
					<View style={styles.step}>
						<View style={styles.stepCircle}>
							<Text style={[styles.stepNumber, styles.stepNumberInactive]}>2</Text>
						</View>
						<Text style={styles.stepLabel}>Pago</Text>
					</View>
					<View style={styles.stepSeparator} />
					<View style={styles.step}>
						<View style={styles.stepCircle}>
							<Text style={[styles.stepNumber, styles.stepNumberInactive]}>3</Text>
						</View>
						<Text style={styles.stepLabel}>Confirmación</Text>
					</View>
				</View>

				{/* Información de Envío */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.checkBadge}>
							<Ionicons name="checkmark" size={12} color={GREEN} />
						</View>
						<Text style={styles.sectionTitle}>Información de Envío</Text>
					</View>
					<Text style={styles.sectionSubtitle}>
						Ingresá la dirección donde deseas recibir tu pedido
					</Text>

					<View style={styles.formRow}>
						<View style={styles.formField}>
							<Text style={styles.label}>Nombre *</Text>
							<TextInput
								style={styles.input}
								value={formData.name}
								onChangeText={(text) => setFormData({ ...formData, name: text })}
								placeholder="Tu nombre"
								placeholderTextColor={GRAY}
							/>
						</View>
						<View style={styles.formField}>
							<Text style={styles.label}>Apellido *</Text>
							<TextInput
								style={styles.input}
								value={formData.lastName}
								onChangeText={(text) => setFormData({ ...formData, lastName: text })}
								placeholder="Tu apellido"
								placeholderTextColor={GRAY}
							/>
						</View>
					</View>

					<View style={styles.formRow}>
						<View style={styles.formField}>
							<Text style={styles.label}>Email *</Text>
							<TextInput
								style={styles.input}
								value={formData.email}
								onChangeText={(text) => setFormData({ ...formData, email: text })}
								placeholder="tu@email.com"
								keyboardType="email-address"
								placeholderTextColor={GRAY}
							/>
						</View>
						<View style={styles.formField}>
							<Text style={styles.label}>Teléfono *</Text>
							<TextInput
								style={styles.input}
								value={formData.phone}
								onChangeText={(text) => setFormData({ ...formData, phone: text })}
								placeholder="Tu teléfono"
								keyboardType="phone-pad"
								placeholderTextColor={GRAY}
							/>
						</View>
					</View>

					<View style={styles.formField}>
						<Text style={styles.label}>Dirección *</Text>
						<TextInput
							style={styles.input}
							value={formData.address}
							onChangeText={(text) => setFormData({ ...formData, address: text })}
							placeholder="Calle, número, departamento..."
							placeholderTextColor={GRAY}
						/>
					</View>

					<View style={[styles.formRow, { marginTop: 8 }] }>
						<View style={styles.formField}>
							<Text style={styles.label}>Ciudad *</Text>
							<TextInput
								style={styles.input}
								value={formData.city}
								onChangeText={(text) => setFormData({ ...formData, city: text })}
								placeholder="Tu ciudad"
								placeholderTextColor={GRAY}
							/>
						</View>
						<View style={styles.formField}>
							<Text style={styles.label}>Distrito *</Text>
							<TextInput
								style={styles.input}
								value={formData.district}
								onChangeText={(text) => setFormData({ ...formData, district: text })}
								placeholder="Tu distrito"
								placeholderTextColor={GRAY}
							/>
						</View>
					</View>

					<View style={styles.formField}>
						<Text style={styles.label}>Código Postal *</Text>
						<TextInput
							style={styles.input}
							value={formData.postalCode}
							onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
							placeholder="Tu código postal"
							keyboardType="numeric"
							placeholderTextColor={GRAY}
						/>
					</View>

					<View style={styles.saveInfoRow}>
						<TouchableOpacity onPress={() => setSaveInfo(!saveInfo)}>
							{saveInfo ? (
								<Ionicons name="checkmark-circle" size={20} color={GREEN} />
							) : (
								<View style={styles.checkboxEmpty} />
							)}
						</TouchableOpacity>
						<Text style={styles.saveInfoText}>
							Guardar esta información para futuras compras
						</Text>
					</View>
				</View>

				{/* Método de Envío */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.checkBadge}>
							<Ionicons name="checkmark" size={12} color={GREEN} />
						</View>
						<Text style={styles.sectionTitle}>Método de Envío</Text>
					</View>
					<Text style={styles.sectionSubtitle}>
						Elije cómo deseas recibir tu pedido
					</Text>

					<View style={styles.shippingOptions}>
						<TouchableOpacity
							style={[
								styles.shippingOption,
								selectedShipping === 'standard' && styles.shippingOptionSelected,
							]}
							onPress={() => setSelectedShipping('standard')}
						>
							<View style={styles.shippingOptionLeft}>
																				<View style={styles.selectorContainer}>
																					{selectedShipping === 'standard' ? (
																						<View style={styles.selectorOuter}>
																							<View style={styles.selectorDot} />
																						</View>
																					) : (
																						<View style={styles.selectorEmpty} />
																					)}
																				</View>
										<View style={styles.shippingIcon}>
											<Ionicons name="car" size={20} color={selectedShipping === 'standard' ? GREEN : DARK_GRAY} />
										</View>
										<View style={styles.shippingText}>
											<Text style={styles.shippingTitle}>Envío Estándar</Text>
											<Text style={styles.shippingDetail}>5-7 días hábiles</Text>
										</View>
									</View>
									<Text style={[styles.shippingPrice, selectedShipping === 'standard' && styles.shippingPriceSelected]}>Gratis</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.shippingOption,
								selectedShipping === 'express' && styles.shippingOptionSelected,
							]}
							onPress={() => setSelectedShipping('express')}
						>
							<View style={styles.shippingOptionLeft}>
																<View style={styles.selectorContainer}>
																	{selectedShipping === 'express' ? (
																		<View style={styles.selectorOuter}>
																			<View style={styles.selectorDot} />
																		</View>
																	) : (
																		<View style={styles.selectorEmpty} />
																	)}
																</View>
								<View style={styles.shippingIcon}>
									<Ionicons name="flash" size={20} color={selectedShipping === 'express' ? GREEN : DARK_GRAY} />
								</View>
								<View style={styles.shippingText}>
									<Text style={styles.shippingTitle}>Envío Express</Text>
									<Text style={styles.shippingDetail}>2-3 días hábiles</Text>
								</View>
							</View>
							<Text style={[styles.shippingPrice, selectedShipping === 'express' && styles.shippingPriceSelected]}>$15</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.shippingOption,
								selectedShipping === 'night' && styles.shippingOptionSelected,
							]}
							onPress={() => setSelectedShipping('night')}
						>
							<View style={styles.shippingOptionLeft}>
																<View style={styles.selectorContainer}>
																	{selectedShipping === 'night' ? (
																		<View style={styles.selectorOuter}>
																			<View style={styles.selectorDot} />
																		</View>
																	) : (
																		<View style={styles.selectorEmpty} />
																	)}
																</View>
								<View style={styles.shippingIcon}>
									<Ionicons name="moon" size={20} color={selectedShipping === 'night' ? GREEN : DARK_GRAY} />
								</View>
								<View style={styles.shippingText}>
									<Text style={styles.shippingTitle}>Envío Nocturno</Text>
									<Text style={styles.shippingDetail}>1 día hábil</Text>
								</View>
							</View>
							<Text style={[styles.shippingPrice, selectedShipping === 'night' && styles.shippingPriceSelected]}>$30</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Resumen del Pedido */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<View style={styles.checkBadgeAlt}>
							<Ionicons name="checkmark" size={12} color={GREEN} />
						</View>
						<Text style={styles.sectionTitle}>Resumen del Pedido</Text>
						<TouchableOpacity onPress={() => router.push('/cart')} style={styles.editCartBtn}>
							<Text style={styles.editCartText}>Editar</Text>
						</TouchableOpacity>
					</View>

									{cart && cart.length > 0 ? (
										// Mostrar todos los ítems del carrito
										cart.map((it, idx) => {
											const prod = typeof it.productId === 'object' ? (it.productId as any) : null;
											const imageUri = prod && prod.images && prod.images.length > 0 ? prod.images[0] : 'https://via.placeholder.com/60?text=Producto';
											const name = prod?.name || 'Producto';
											const size = it.size || prod?.sizes?.[0] || '';
											const quantity = it.quantity || 1;
											const price = (prod?.price ?? 0) * quantity; // mostrar precio total por línea
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

					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Subtotal</Text>
						<Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
					</View>

					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Envío</Text>
						<Text style={styles.summaryValue}>{shippingCost === 0 ? 'Gratis' : `$${shippingCost}`}</Text>
					</View>

					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>IVA (16%)</Text>
						<Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
					</View>

					<View style={styles.summaryTotal}>
						<Text style={styles.totalLabel}>Total</Text>
						<Text style={styles.totalValue}>${total.toFixed(2)}</Text>
					</View>

					<View style={styles.ecoBanner}>
						<View style={styles.ecoIcon}>
							<Ionicons name="leaf" size={14} color={GREEN} />
						</View>
						<Text style={styles.ecoText}>
							Tu compra ayuda al planeta. Usamos empaques 100% reciclables.
						</Text>
					</View>
				</View>

				{/* Botón Continuar al Pago */}
				<TouchableOpacity style={[styles.continueButton, loading ? { opacity: 0.6 } : null]} onPress={handleContinue} disabled={loading}>
					<Text style={styles.continueButtonText}>Continuar al Pago</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		backgroundColor: WHITE,
	},
	container: {
		paddingHorizontal: 16,
		paddingBottom: 40,
	},
	header: {
		marginTop: 0,
		marginBottom: 8,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
	},
	headerTextWrap: {
		flex: 1,
	},
	headerTitleWrap: {
		marginLeft: 10, /* backButton width (40) + 16 for a bit more horizontal space */
		marginBottom: 8,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: DARK_GRAY,
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: GRAY,
	},

	steps: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 12,
	},
	step: {
		flexDirection: 'column',
		alignItems: 'center',
		flex: 1,
	},
	stepCircle: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#E5E7EB',
		alignItems: 'center',
		justifyContent: 'center',
	},
	stepActive: {
		backgroundColor: GREEN,
	},
	stepNumber: {
		color: WHITE,
		fontWeight: 'bold',
		fontSize: 14,
	},
	stepNumberActive: {
		color: WHITE,
		fontWeight: 'bold',
		fontSize: 14,
	},
	stepNumberInactive: {
		color: GRAY,
		fontWeight: 'bold',
		fontSize: 14,
	},
	stepLabel: {
		fontSize: 12,
		color: GRAY,
		marginTop: 4,
	},
	stepActiveLabel: {
		color: GREEN,
		fontWeight: '700',
	},
	stepSeparator: {
		width: 20,
		borderBottomWidth: 1,
		borderColor: '#D1D5DB',
	},

	section: {
		backgroundColor: WHITE,
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: DARK_GRAY,
		marginLeft: 8,
	},
	sectionSubtitle: {
		fontSize: 13,
		color: GRAY,
		marginBottom: 16,
	},

	formRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 12,
	},
	formField: {
		flex: 1,
	},
	label: {
		fontSize: 13,
		fontWeight: '600',
		color: DARK_GRAY,
		marginBottom: 4,
	},
	input: {
		backgroundColor: '#F9FAFB',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: DARK_GRAY,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},

	saveInfoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 16,
	},
	checkboxEmpty: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: GRAY,
	},
	saveInfoText: {
		fontSize: 14,
		color: DARK_GRAY,
		marginLeft: 8,
	},

	shippingOptions: {
		marginTop: 8,
	},
	iconContainer: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	checkBadge: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: GREEN,
		backgroundColor: WHITE,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
	},
	checkBadgeAlt: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: GREEN,
		backgroundColor: WHITE,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
	},
	shippingOption: {
		backgroundColor: '#F9FAFB',
		borderRadius: 10,
		padding: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	shippingOptionSelected: {
		backgroundColor: '#ECFDF5',
		borderColor: GREEN,
	},
	shippingOptionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	radioEmpty: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: GRAY,
		marginRight: 12,
	},
	selectorContainer: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 8,
	},
	selectorEmpty: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 2,
		borderColor: GRAY,
		backgroundColor: WHITE,
	},
	selectorOuter: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 2,
		borderColor: GREEN,
		backgroundColor: WHITE,
		alignItems: 'center',
		justifyContent: 'center',
	},
	selectorDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: GREEN,
	},
	shippingIcon: {
		marginRight: 12,
	},
	shippingText: {
		flex: 1,
	},
	shippingTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: DARK_GRAY,
	},
	shippingDetail: {
		fontSize: 13,
		color: GRAY,
		marginTop: 2,
	},
	shippingPrice: {
		fontSize: 16,
		fontWeight: 'bold',
		color: DARK_GRAY,
		alignSelf: 'center',
	},
	shippingPriceSelected: {
		color: GREEN,
	},

	productSummary: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	productImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 12,
	},
	productDetails: {
		flex: 1,
	},
	productName: {
		fontSize: 16,
		fontWeight: '600',
		color: DARK_GRAY,
	},
	productInfo: {
		fontSize: 13,
		color: GRAY,
		marginTop: 2,
	},
	productPrice: {
		fontSize: 16,
		fontWeight: 'bold',
		color: DARK_GRAY,
	},

	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderColor: '#E5E7EB',
	},
	summaryLabel: {
		fontSize: 14,
		color: DARK_GRAY,
	},
	summaryValue: {
		fontSize: 14,
		fontWeight: '600',
		color: DARK_GRAY,
	},

	summaryTotal: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 12,
		borderTopWidth: 2,
		borderColor: '#E5E7EB',
	},
	totalLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		color: DARK_GRAY,
	},
	totalValue: {
		fontSize: 18,
		fontWeight: 'bold',
		color: GREEN,
	},

	ecoBanner: {
			backgroundColor: '#ECFDF5',
			borderRadius: 8,
			padding: 12,
			marginTop: 12,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'flex-start',
			gap: 6,
	},
		ecoIcon: {
			width: 20,
			height: 20,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 8,
		},
		ecoText: {
			fontSize: 13,
			color: GREEN,
			textAlign: 'justify',
			flex: 1,
			flexWrap: 'wrap',
			flexShrink: 1,
		},

		/* Edit Cart button in summary header */
		editCartBtn: {
			marginLeft: 'auto',
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 6,
		},
		editCartText: {
			color: GREEN,
			fontWeight: '600',
			fontSize: 13,
		},

	continueButton: {
		backgroundColor: GREEN,
		borderRadius: 10,
		paddingVertical: 16,
		alignItems: 'center',
		width: '100%',
		marginTop: 20,
	},
	continueButtonText: {
		color: WHITE,
		fontSize: 18,
		fontWeight: 'bold',
	},
});