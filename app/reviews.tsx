import { useAuth } from '@/context/AuthContext';
import { createReview, getReviews } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#00a63e';

interface Review {
	id: string;
	name: string;
	date: string;
	rating: number;
	title: string;
	comment: string;
	verified?: boolean;
}

export default function ReviewsScreen() {
	const { user } = useAuth();
	const [reviews, setReviews] = useState<Review[]>([
		{
			id: '1',
			name: 'rodrigo',
			date: '22 nov 2025',
			rating: 5,
			title: 'Excelente calidad',
			comment: 'Los productos son sostenibles y muy cómodos. ¡Volveré a comprar!',
		},
		{
			id: '2',
			name: 'Ismael',
			date: '22 nov 2025',
			rating: 4,
			title: 'Buena experiencia',
			comment: 'El envío fue rápido y el material se siente premium.',
		},
	]);

	// Name/email are provided by authenticated user on the backend; no inputs shown.
	const [title, setTitle] = useState('');
	const [comment, setComment] = useState('');
	const [rating, setRating] = useState(0);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const POLL_INTERVAL = 10000; // 10s
	const appState = useRef(AppState.currentState);
	const pollRef = useRef<number | null>(null);

	const averageRating =
		reviews.length === 0
			? 0
			: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

	const totalReviews = reviews.length;

	const fetchReviews = async () => {
		try {
			setLoading(true);
			const res = await getReviews({ limit: 50 });
			const mapped: Review[] = res.data.map((r) => ({
				id: (r as any)._id,
				name: (r as any).author || (r as any).productName || 'Usuario',
				date: (r as any).createdAt ? new Date((r as any).createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
				rating: (r as any).rating,
				title: (r as any).title,
				comment: (r as any).content,
				verified: (r as any).verified,
			}));
			setReviews(mapped);
		} catch (err) {
			console.error('Error loading reviews:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// initial fetch
		fetchReviews();

		// polling
		pollRef.current = setInterval(() => {
			fetchReviews();
		}, POLL_INTERVAL);

		// refresh when app comes to foreground
		const sub = AppState.addEventListener('change', (nextAppState) => {
			if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
				fetchReviews();
			}
			appState.current = nextAppState;
		});

		return () => {
			if (pollRef.current) clearInterval(pollRef.current as any);
			sub.remove();
		};
	}, []);

	const handleSubmit = async () => {
		if (!title || !comment || rating === 0) {
			alert('Por favor completa todos los campos');
			return;
		}

		try {
			setSubmitting(true);
			const body = { title, content: comment, rating };
			const res = await createReview(body);
			// backend returns success message; the review will be pending moderation so may not appear in list
			alert(res.message || 'Reseña enviada. Será publicada tras revisión.');
			// Optionally prepend a local pending review for immediate feedback
			const pending: Review = {
				id: res.data?._id || Date.now().toString(),
				name: user?.name || 'Usuario',
				date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
				rating,
				title,
				comment,
				verified: false,
			};
			setReviews([pending, ...reviews]);
			setTitle('');
			setComment('');
			setRating(0);
		} catch (err: any) {
			console.error('Error submitting review:', err);
			alert(err.message || 'Error al enviar reseña');
		} finally {
			setSubmitting(false);
		}
	};

	const renderStars = (
		rating: number,
		size = 20,
		interactive = false,
		onChange?: (rating: number) => void
	) => {
		return (
			<View style={styles.starRow}>
				{[1, 2, 3, 4, 5].map((star) => (
					<TouchableOpacity
						key={star}
						onPress={() => interactive && onChange && onChange(star)}
						activeOpacity={interactive ? 0.7 : 1}
					>
						<Ionicons
							name={star <= rating ? 'star' : 'star-outline'}
							size={size}
							color="#FFA500"
						/>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	const renderItem = ({ item }: { item: Review }) => (
		<View style={styles.reviewCard}>
			<View style={styles.reviewHeader}>
				<View style={styles.avatarCircle}>
					<Text style={styles.avatarLetter}>
						{item.name.charAt(0).toUpperCase()}
					</Text>
				</View>
				<View style={{ flex: 1, marginLeft: 12 }}>
					<View style={styles.nameRow}>
						<Text style={styles.reviewName}>{item.name}</Text>
						{item.verified && (
							<View style={styles.verifiedBadge}>
								<Text style={styles.verifiedText}>✓ Verificado</Text>
							</View>
						)}
					</View>
					<Text style={styles.reviewDate}>{item.date}</Text>
				</View>
			</View>

			<View style={{ marginTop: 8 }}>{renderStars(item.rating, 16)}</View>

			<Text style={styles.reviewTitle}>{item.title}</Text>
			<Text style={styles.reviewBody}>{item.comment}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.safe}>
			<ScrollView
				contentContainerStyle={styles.container}
				keyboardShouldPersistTaps="handled"
			>
				{/* Hero Section */}
				<View style={styles.hero}>
					<View style={styles.heroIcon}>
						<Ionicons name="chatbox" size={28} color="#FFFFFF" />
					</View>
					<Text style={styles.heroTitle}>Experiencias de Nuestros Clientes</Text>
					<Text style={styles.heroSubtitle}>
						Lee las historias reales de personas que han elegido un estilo de vida más
						sostenible con EcoVestir
					</Text>

					{/* Stats inside hero: left = total reviews, right = average rating */}
					<View style={styles.heroStatsRow}>
						<View style={styles.heroStatContainerLeft}>
							<Text style={styles.heroStatNumberLeft}>{totalReviews}</Text>
							<Text style={styles.heroStatLabelWhite}>Reseñas</Text>
						</View>
						<View style={styles.heroStatContainerRight}>
							<View style={styles.heroRatingRow}>
								<Text style={styles.heroStatNumberRight}>{averageRating}</Text>
								<Ionicons name="star" size={22} color="#FFD166" style={{ marginLeft: 8 }} />
							</View>
							<Text style={styles.heroStatLabelWhite}>Calificación Promedio</Text>
						</View>
					</View>
				</View>

				{loading ? (
					<View style={{ padding: 24, alignItems: 'center' }}>
						<ActivityIndicator size="large" color={GREEN} />
					</View>
				) : (
					<View style={styles.formCard}>
						<View style={styles.formHeader}>
							<Ionicons name="create-outline" size={20} color={GREEN} />
							<Text style={styles.formTitle}>Comparte tu Experiencia</Text>
						</View>

						<Text style={styles.label}>Título *</Text>
						<TextInput
							value={title}
							onChangeText={setTitle}
							placeholder="Resumen de tu experiencia"
							placeholderTextColor="#9CA3AF"
							style={styles.input}
						/>

						<Text style={styles.label}>Tu Reseña *</Text>
						<TextInput
							value={comment}
							onChangeText={setComment}
							placeholder="Cuéntanos sobre tu experiencia con EcoVestir..."
							placeholderTextColor="#9CA3AF"
							style={[styles.input, styles.textarea]}
							multiline
						/>

						<Text style={styles.label}>Calificación *</Text>
						<View style={{ marginVertical: 8 }}>
							{renderStars(rating, 28, true, setRating)}
						</View>

						<TouchableOpacity
							style={[styles.publishButton, submitting ? { opacity: 0.6 } : undefined]}
							onPress={handleSubmit}
							activeOpacity={0.85}
							disabled={submitting}
						>
							<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
							<Text style={styles.publishButtonText}>Publicar Reseña</Text>
						</TouchableOpacity>

						<Text style={styles.smallNote}>
							Al publicar aceptas nuestros términos y condiciones
						</Text>
					</View>
				)}

				{/* Reviews List */}
				<View style={styles.listContainer}>
					<Text style={styles.listTitle}>Todas las Reseñas</Text>
					<Text style={styles.listSubtitle}>
						{reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'} verificadas por
						nuestra comunidad
					</Text>

					<FlatList
						data={reviews}
						keyExtractor={(item) => item.id}
						renderItem={renderItem}
						ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
						scrollEnabled={false}
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#F3F4F6' },
	container: { paddingBottom: 40 },
	hero: {
		backgroundColor: GREEN,
		paddingVertical: 28,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	heroIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: 'rgba(255,255,255,0.18)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	heroTitle: {
		color: '#FFFFFF',
		fontSize: 25,
		fontWeight: '800',
		textAlign: 'center',
	},
	heroSubtitle: {
		color: 'rgba(255,255,255,0.95)',
		fontSize: 13,
		textAlign: 'center',
		marginTop: 8,
		lineHeight: 18,
	},

		heroStatsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginTop: 18, width: '100%' },
		heroStatContainerLeft: { flex: 1, alignItems: 'center', justifyContent: 'center'},
		heroStatNumberLeft: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
		heroStatContainerRight: { flex: 1, alignItems: 'center', justifyContent: 'center' },
		heroRatingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
		heroStatNumberRight: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
		heroStatLabelWhite: { fontSize: 13, color: 'rgba(255,255,255,0.95)', marginTop: 8 },

	formCard: {
		backgroundColor: '#FFFFFF',
		marginHorizontal: 16,
		marginTop: 16,
		borderRadius: 12,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		elevation: 2,
	},
	formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
	formTitle: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#1F2937' },
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 6,
		marginTop: 12,
	},
	input: {
		backgroundColor: '#F9FAFB',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		color: '#1F2937',
		fontSize: 16,
	},
	textarea: { minHeight: 100, textAlignVertical: 'top' },
	publishButton: {
		marginTop: 16,
		backgroundColor: GREEN,
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	publishButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
	smallNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 },

	listContainer: { marginHorizontal: 16, marginTop: 16 },
	listTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
	listSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 12 },

	reviewCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.03,
		elevation: 1,
	},
	reviewHeader: { flexDirection: 'row', alignItems: 'center' },
	avatarCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: GREEN,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarLetter: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
	nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	reviewName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
	verifiedBadge: {
		marginLeft: 8,
		backgroundColor: '#D1FAE5',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	verifiedText: { color: GREEN, fontWeight: '700', fontSize: 12 },
	reviewDate: { fontSize: 13, color: '#6B7280', marginTop: 4 },
	reviewTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginTop: 10 },
	reviewBody: { fontSize: 14, color: '#6B7280', marginTop: 6, lineHeight: 20 },

	starRow: { flexDirection: 'row', gap: 6 },
});